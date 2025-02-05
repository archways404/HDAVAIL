const { createSchedule } = require('../functions/createSchedule');
const { fetchSchedule } = require('../functions/fetchSchedule');

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

	// Get Active Shifts for a Schedule Group
	fastify.get('/getActiveShiftsForGroup', async (request, reply) => {
		try {
			const { group_id } = request.query;

			// Validate that `group_id` is provided
			if (!group_id) {
				return reply.status(400).send({ error: 'Group ID is required' });
			}

			// Query to fetch active shifts with shift type and user details
			const query = `
			SELECT 
				asf.shift_id, 
				asf.shift_type_id, 
				st.name_long AS shift_type_long,
				st.name_short AS shift_type_short,
				asf.assigned_to, 
				acc.user_id AS assigned_user_id,
				acc.email AS assigned_user_email,
				acc.first_name AS assigned_user_first_name,
				acc.last_name AS assigned_user_last_name,
				asf.start_time, 
				asf.end_time, 
				asf.date, 
				asf.schedule_group_id
			FROM 
				active_shifts asf
			LEFT JOIN 
				shift_types st ON asf.shift_type_id = st.shift_type_id
			LEFT JOIN 
				account acc ON asf.assigned_to = acc.user_id
			WHERE 
				asf.schedule_group_id = $1
		`;

			// Execute the query
			const { rows } = await fastify.pg.query(query, [group_id]);

			console.log('rows', rows);

			// Transform data for BigCalendar format
			const formattedData = rows.map((shift) => ({
				id: shift.shift_id,
				title: shift.shift_type_short,
				start: new Date(
					`${shift.date.toISOString().split('T')[0]}T${shift.start_time}`
				),
				end: new Date(
					`${shift.date.toISOString().split('T')[0]}T${shift.end_time}`
				),
				description: `${shift.shift_type_long || 'N/A'}`,
				extendedProps: {
					shiftTypeId: shift.shift_type_id,
					shiftTypeLong: shift.shift_type_long,
					shiftTypeShort: shift.shift_type_short,
					assignedTo: shift.assigned_to,
					assignedUserId: shift.assigned_user_id,
					assignedUserEmail: shift.assigned_user_email,
					assignedUserFirstName: shift.assigned_user_first_name,
					assignedUserLastName: shift.assigned_user_last_name,
					scheduleGroupId: shift.schedule_group_id,
				},
			}));

			console.log('formattedData', formattedData);

			// Send the transformed data to the client
			return reply.send(formattedData);

			// Send the results back to the client
			//return reply.send(rows);
		} catch (error) {
			console.error('Error fetching active shifts:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch active shifts' });
		}
	});

	// Get Schedule Groups for a User
	fastify.get('/getScheduleGroups', async (request, reply) => {
		try {
			const { user_id } = request.query;

			// Check if `user_id` is provided
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			// Query to fetch schedule groups for the user
			const query = `
			SELECT sg.group_id, sg.name, sg.description
			FROM account_schedule_groups as asg
			JOIN schedule_groups as sg
			ON asg.group_id = sg.group_id
			WHERE asg.user_id = $1
		`;

			// Execute the query
			const { rows } = await fastify.pg.query(query, [user_id]);

			// Respond with the schedule groups
			return reply.send(rows);
		} catch (error) {
			console.error('Get schedule groups error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to fetch schedule groups' });
		}
	});

	fastify.get('/getAllScheduleGroups', async (request, reply) => {
		try {
			const { user_id } = request.query;
			let query;
			let params = [];

			if (user_id) {
				query = `
        SELECT group_id, name, description
        FROM schedule_groups
        WHERE group_id NOT IN (
          SELECT group_id
          FROM account_schedule_groups
          WHERE user_id = $1
        )
      `;
				params.push(user_id);
			} else {
				query = `
        SELECT group_id, name, description
        FROM schedule_groups
      `;
			}

			const { rows } = await fastify.pg.query(query, params);
			return reply.send(rows);
		} catch (error) {
			console.error('Error fetching all schedule groups:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to fetch schedule groups' });
		}
	});

	fastify.post('/assignScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.body;
			if (!user_id || !group_id) {
				return reply
					.status(400)
					.send({ error: 'user_id and group_id are required' });
			}

			// Optionally, check if this relationship already exists to avoid duplicates.
			const checkQuery = `
      SELECT * FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
    `;
			const checkResult = await fastify.pg.query(checkQuery, [
				user_id,
				group_id,
			]);
			if (checkResult.rows.length > 0) {
				return reply
					.status(409)
					.send({ error: 'Schedule group already assigned to the user' });
			}

			const query = `
      INSERT INTO account_schedule_groups (user_id, group_id)
      VALUES ($1, $2)
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			return reply.status(201).send(rows[0]);
		} catch (error) {
			console.error('Error assigning schedule group:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to assign schedule group' });
		}
	});

	fastify.delete('/removeScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.query;
			if (!user_id || !group_id) {
				return reply
					.status(400)
					.send({ error: 'user_id and group_id are required' });
			}

			const query = `
      DELETE FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			if (rows.length === 0) {
				return reply
					.status(404)
					.send({ error: 'Schedule group assignment not found' });
			}
			return reply.send({ message: 'Schedule group removed successfully' });
		} catch (error) {
			console.error('Error removing schedule group:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to remove schedule group' });
		}
	});

	fastify.post('/unlockAccount', async (request, reply) => {
		try {
			const { user_id } = request.body;
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			const query = `
      UPDATE account_lockout
      SET locked = false,
          failed_attempts = 0,
          unlock_time = NULL
      WHERE user_id = $1
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Lockout record not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error unlocking account:', error.message);
			return reply.status(500).send({ error: 'Failed to unlock account' });
		}
	});

	fastify.post('/lockAccount', async (request, reply) => {
		try {
			const { user_id } = request.body;
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			const query = `
      UPDATE account_lockout
      SET locked = true,
          unlock_time = NOW() + interval '1000 years'
      WHERE user_id = $1
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Lockout record not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error locking account:', error.message);
			return reply.status(500).send({ error: 'Failed to lock account' });
		}
	});
}

module.exports = routes;

/* OLD
fastify.get('/scheduleTemplate', async (request, reply) => {
		try {
			const scheduleTemplate = createSchedule();
			return reply.send(scheduleTemplate);
		} catch (error) {
			console.error('Template error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to crate using template' });
		}
	});

	fastify.post('/createSchedule', async (request, reply) => {
		try {
			console.log('req.body', request.body);
		} catch (error) {
			console.error('Template error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to crate using template' });
		}
	});

	// View Schedule Route
	fastify.get('/viewSchedule', async (request, reply) => {
		try {
			const { uuid } = request.query;
			let globalSchedule;

			if (!uuid) {
				// Use the cache-handling function
				globalSchedule = await handleHDCache(fastify.pg);
			} else {
				// Fetch schedule for specific UUID
				try {
					globalSchedule = await fetchSchedule(fastify.pg, uuid);
				} catch (error) {
					console.error('Template error:', error.message);
					return reply
						.status(500)
						.send({ error: 'Failed to crate using template' });
				}
			}

			return reply.send(globalSchedule);
		} catch (error) {
			console.error('View schedule error:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch schedule' });
		}
	});
*/