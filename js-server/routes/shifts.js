const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

const { updateHDCache } = require('../functions/cache');
const { handleHDCache } = require('../functions/cache');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		startRequest(request);
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		request.sendTime = Date.now();
		endRequest(request);
		const times = calculateRequest(request);
		console.log(`Request stats: ${JSON.stringify(times)}`);
		done();
	});

	fastify.post('/createShiftType', async (request, reply) => {
		const { name_long, name_short } = request.body;

		if (!name_long || !name_short) {
			return reply
				.status(400)
				.send({ error: 'name_long and name_short are required' });
		}

		const client = await fastify.pg.connect();

		try {
			// Check if shift type already exists
			const checkQuery = `
      SELECT * FROM shift_types 
      WHERE name_long = $1 OR name_short = $2;
    `;
			const checkResult = await client.query(checkQuery, [
				name_long,
				name_short,
			]);

			if (checkResult.rows.length > 0) {
				return reply.status(200).send({ message: 'Shift type already exists' });
			}

			// Insert new shift type
			const insertQuery = `
      INSERT INTO shift_types (name_long, name_short) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
			const insertResult = await client.query(insertQuery, [
				name_long,
				name_short,
			]);

			return reply.status(201).send({
				message: 'Shift type created successfully',
				shift_type: insertResult.rows[0],
			});
		} catch (error) {
			console.error('Error creating shift type:', error);
			return reply.status(500).send({ error: 'Failed to create shift type' });
		} finally {
			client.release(); // Release the client back to the pool
		}
	});

	fastify.get('/getShiftTypes', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			// Fetch all shift types
			const query = `SELECT * FROM shift_types;`;
			const result = await client.query(query);

			return reply.status(200).send({
				message: 'Shift types retrieved successfully',
				shift_types: result.rows, // Array of all shift types
			});
		} catch (error) {
			console.error('Error retrieving shift types:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve shift types' });
		} finally {
			client.release(); // Release the client back to the pool
		}
	});

	fastify.get('/getActiveShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { shift_type_id, date, assigned_to } = request.query;

		try {
			let query = `
      SELECT * FROM active_shifts
      WHERE 1=1
    `;
			const queryParams = [];

			if (shift_type_id) {
				queryParams.push(shift_type_id);
				query += ` AND shift_type_id = $${queryParams.length}`;
			}

			if (date) {
				queryParams.push(date);
				query += ` AND date = $${queryParams.length}`;
			}

			if (assigned_to) {
				queryParams.push(assigned_to);
				query += ` AND assigned_to = $${queryParams.length}`;
			}

			const result = await client.query(query, queryParams);

			return reply.status(200).send({
				message: 'Active shifts retrieved successfully',
				active_shifts: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving active shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve active shifts' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getUnassignedShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { group_id, shift_type_id, date, user_id } = request.query;

		// group_id and user_id are required.
		if (!group_id) {
			client.release();
			return reply.status(400).send({ error: 'group_id is required' });
		}
		if (!user_id) {
			client.release();
			return reply.status(400).send({ error: 'user_id is required' });
		}

		try {
			// Base query:
			// - Select shifts where no one is assigned.
			// - The shift belongs to the specified group.
			// - And the shift is not already marked as available for the user.
			let query = `
      SELECT * FROM active_shifts
      WHERE assigned_to IS NULL
        AND schedule_group_id = $1
        AND shift_id NOT IN (
          SELECT shift_id FROM available_for_shift WHERE user_id = $2
        )
    `;
			const queryParams = [group_id, user_id];

			// Optionally filter by shift_type_id.
			if (shift_type_id) {
				queryParams.push(shift_type_id);
				query += ` AND shift_type_id = $${queryParams.length}`;
			}

			// Optionally filter by date.
			if (date) {
				queryParams.push(date);
				query += ` AND date = $${queryParams.length}`;
			}

			const result = await client.query(query, queryParams);

			return reply.status(200).send({
				message: 'Unassigned shifts retrieved successfully',
				unassigned_shifts: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving unassigned shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve unassigned shifts' });
		} finally {
			client.release();
		}
	});

	fastify.post('/insertAvailableForShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { shift_ids, user_id } = request.body;

		// Validate that shift_ids is a non-empty array and that user_id is provided.
		if (!Array.isArray(shift_ids) || shift_ids.length === 0) {
			client.release();
			return reply
				.status(400)
				.send({ error: 'shift_ids must be a non-empty array' });
		}
		if (!user_id) {
			client.release();
			return reply.status(400).send({ error: 'user_id is required' });
		}

		try {
			// Start the transaction.
			await client.query('BEGIN');

			// Build the bulk insert query.
			// We are going to insert one row per shift id with its associated user_id.
			// For example, if there are two shift_ids, we want to build a query like:
			// INSERT INTO available_for_shift (shift_id, user_id)
			// VALUES ($1, $2), ($3, $4)
			let valuesClause = '';
			const queryParams = [];

			shift_ids.forEach((shiftId, index) => {
				// For each shift, add two parameters: one for shift_id and one for user_id.
				const shiftParamIndex = queryParams.length + 1; // current parameter index for shift_id
				const userParamIndex = queryParams.length + 2; // current parameter index for user_id
				queryParams.push(shiftId, user_id);
				valuesClause += `($${shiftParamIndex}, $${userParamIndex})`;
				if (index < shift_ids.length - 1) {
					valuesClause += ', ';
				}
			});

			const insertQuery = `
      INSERT INTO available_for_shift (shift_id, user_id)
      VALUES ${valuesClause}
    `;

			// Execute the bulk insert.
			await client.query(insertQuery, queryParams);

			// Commit the transaction.
			await client.query('COMMIT');

			return reply
				.status(200)
				.send({ message: 'Available shifts inserted successfully' });
		} catch (error) {
			// If any error occurs, rollback the transaction.
			await client.query('ROLLBACK');
			console.error('Error inserting available shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to insert available shifts' });
		} finally {
			// Always release the client back to the pool.
			client.release();
		}
	});

	fastify.get('/getScheduleForGroup', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { group_id } = request.query;

		// Validate that group_id is provided.
		if (!group_id) {
			client.release();
			return reply.status(400).send({ error: 'group_id is required' });
		}

		try {
			const query = `
      SELECT 
        a.shift_id,
        a.shift_type_id,
        a.assigned_to,
        a.start_time,
        a.end_time,
        a.date,
        a.description,
        a.schedule_group_id,
        -- Aggregate available people into a JSON array including their names.
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'user_id', afs.user_id,
              'first_name', acc.first_name,
              'last_name', acc.last_name
            )
          ) FILTER (WHERE afs.user_id IS NOT NULL),
          '[]'
        ) AS available_people
      FROM active_shifts a
      LEFT JOIN available_for_shift afs
        ON a.shift_id = afs.shift_id
      LEFT JOIN account acc
        ON afs.user_id = acc.user_id
      WHERE a.schedule_group_id = $1
      GROUP BY 
        a.shift_id,
        a.shift_type_id,
        a.assigned_to,
        a.start_time,
        a.end_time,
        a.date,
        a.description,
        a.schedule_group_id
      ORDER BY a.date, a.start_time
    `;

			const result = await client.query(query, [group_id]);

			return reply.status(200).send({
				message: 'Schedule retrieved successfully',
				schedule: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving schedule:', error);
			return reply.status(500).send({ error: 'Failed to retrieve schedule' });
		} finally {
			client.release();
		}
	});

	fastify.post('/assignShifts', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { assignments } = request.body;

		// Validate that assignments is a non-empty array.
		if (!Array.isArray(assignments) || assignments.length === 0) {
			client.release();
			return reply
				.status(400)
				.send({ error: 'assignments must be a non-empty array' });
		}

		try {
			// Begin a transaction.
			await client.query('BEGIN');

			// Build the bulk update query using a CASE expression.
			// We cast both shift_id and user_id to uuid.
			let query = 'UPDATE active_shifts SET assigned_to = CASE shift_id ';
			const queryParams = [];
			let paramIndex = 1;
			const shiftIds = [];

			// Build the CASE expression.
			for (const assignment of assignments) {
				// Each assignment object must contain shift_id and user_id.
				// Cast both to uuid.
				query += `WHEN $${paramIndex}::uuid THEN $${paramIndex + 1}::uuid `;
				queryParams.push(assignment.shift_id, assignment.user_id);
				shiftIds.push(assignment.shift_id);
				paramIndex += 2;
			}
			query += 'END ';

			// Add a WHERE clause so that only the provided shift_ids are updated.
			query += 'WHERE shift_id IN (';
			// We add a new set of placeholders for the shift IDs and cast them to uuid.
			for (let i = 0; i < shiftIds.length; i++) {
				query += `$${paramIndex + i}::uuid`;
				if (i < shiftIds.length - 1) {
					query += ', ';
				}
				queryParams.push(shiftIds[i]);
			}
			query += ')';

			// Execute the bulk update query.
			await client.query(query, queryParams);

			// Commit the transaction.
			await client.query('COMMIT');

			return reply
				.status(200)
				.send({ message: 'Shifts assigned successfully' });
		} catch (error) {
			// Rollback the transaction if any error occurs.
			await client.query('ROLLBACK');
			console.error('Error assigning shifts:', error);
			return reply.status(500).send({ error: 'Failed to assign shifts' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
