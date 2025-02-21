const Holidays = require('date-holidays');
const hd = new Holidays('SE');
const { v4: uuidv4 } = require('uuid');

async function routes(fastify, options) {

	fastify.post('/createTemplateMeta', async (request, reply) => {
		const { creator_id, private, name } = request.body;

		if (!creator_id || !name) {
			return reply
				.status(400)
				.send({ error: 'creator_id and name are required' });
		}

		const client = await fastify.pg.connect();

		try {
			const query = `
      INSERT INTO template_meta (creator_id, private, name)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

			const result = await client.query(query, [
				creator_id,
				private || false,
				name,
			]);

			return reply.status(201).send({
				message: 'Template meta created successfully',
				template_meta: result.rows[0],
			});
		} catch (error) {
			console.error('Error creating template meta:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to create template meta' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getTemplateMeta', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { user_id } = request.query;

		if (!user_id) {
			return reply.status(400).send({ error: 'user_id is required' });
		}

		try {
			const query = `
      SELECT * FROM template_meta
      WHERE private = FALSE OR creator_id = $1;
    `;
			const result = await client.query(query, [user_id]);

			return reply.status(200).send({
				message: 'Template meta records retrieved successfully',
				template_meta: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving template meta:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve template meta' });
		} finally {
			client.release();
		}
	});

	fastify.post('/createTemplate', async (request, reply) => {
		const { template_id, shifts } = request.body;

		if (!template_id || !Array.isArray(shifts) || shifts.length === 0) {
			return reply.status(400).send({
				error: 'template_id and an array of shifts are required',
			});
		}

		const client = await fastify.pg.connect();

		try {
			const insertedShifts = [];

			for (const shift of shifts) {
				const { shift_type_id, weekday, start_time, end_time } = shift;

				if (
					!shift_type_id ||
					weekday === undefined ||
					!start_time ||
					!end_time
				) {
					return reply.status(400).send({
						error:
							'shift_type_id, weekday, start_time, and end_time are required for each shift',
					});
				}

				const insertQuery = `
        INSERT INTO templates (template_id, shift_type_id, weekday, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

				const result = await client.query(insertQuery, [
					template_id,
					shift_type_id,
					weekday,
					start_time,
					end_time,
				]);

				insertedShifts.push(result.rows[0]);
			}

			return reply.status(201).send({
				message: 'Template with multiple shifts created successfully',
				shifts: insertedShifts,
			});
		} catch (error) {
			console.error('Error creating template:', error);
			return reply.status(500).send({ error: 'Failed to create template' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getTemplates', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { template_id } = request.query; // Extract `template_id` from query parameters

		if (!template_id) {
			return reply.status(400).send({ error: 'template_id is required' });
		}

		try {
			const query = `
      SELECT t.*, tm.creator_id, tm.private, tm.name
      FROM templates t
      JOIN template_meta tm ON t.template_id = tm.template_id
      WHERE t.template_id = $1;
    `;
			const result = await client.query(query, [template_id]);

			if (result.rows.length === 0) {
				return reply
					.status(404)
					.send({ message: 'No templates found for the given template_id' });
			}

			return reply.status(200).send({
				message: 'Templates retrieved successfully',
				templates: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving templates:', error);
			return reply.status(500).send({ error: 'Failed to retrieve templates' });
		} finally {
			client.release();
		}
	});

	fastify.post('/insertActiveShifts', async (request, reply) => {
		const myData = request.body;

		// Transform each event
		const transformedData = myData.map((item) => {
			// Destructure the fields from extendedProps
			const { shift_type_id, description, group_id } = item.extendedProps || {};
			// Split the start and end strings at the 'T'
			const [date, start_time] = item.start.split('T');
			const [, end_time] = item.end.split('T');
			return {
				shift_type_id,
				description,
				schedule_group_id: group_id,
				date,
				start_time,
				end_time,
			};
		});

		console.log('Transformed Data:', transformedData);

		// Bulk insert using a single query in a transaction.
		const client = await fastify.pg.connect();
		try {
			// Begin transaction
			await client.query('BEGIN');

			// Define the columns to insert.
			const columns = [
				'shift_type_id',
				'start_time',
				'end_time',
				'date',
				'description',
				'schedule_group_id',
			];
			// Build the parameterized values array and placeholder strings.
			const values = [];
			const valuePlaceholders = transformedData.map((shift, index) => {
				const startIndex = index * columns.length + 1;
				values.push(
					shift.shift_type_id,
					shift.start_time,
					shift.end_time,
					shift.date,
					shift.description,
					shift.schedule_group_id
				);
				const placeholders = columns.map((_, i) => `$${startIndex + i}`);
				return `(${placeholders.join(',')})`;
			});

			const insertQuery = `
      INSERT INTO active_shifts (${columns.join(',')})
      VALUES ${valuePlaceholders.join(',')}
      RETURNING *;
    `;
			const result = await client.query(insertQuery, values);

			// If everything is successful, commit the transaction.
			await client.query('COMMIT');

			return reply.status(201).send({
				message: 'Active shifts created successfully',
				shifts: result.rows,
			});
		} catch (error) {
			// If there is an error, rollback the transaction.
			await client.query('ROLLBACK');
			console.error('Error inserting active shifts:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to insert active shifts' });
		} finally {
			client.release();
		}
	});
	
	fastify.get('/getTemplateMetaForUser', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { user_id } = request.query;

		if (!user_id) {
			return reply.status(400).send({ error: 'user_id is required' });
		}

		try {
			const query = `
      SELECT * FROM template_meta
      WHERE creator_id = $1;
    `;
			const result = await client.query(query, [user_id]);

			return reply.status(200).send({
				message: 'Template meta records retrieved successfully',
				template_meta: result.rows,
			});
		} catch (error) {
			console.error('Error retrieving template meta:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve template meta' });
		} finally {
			client.release();
		}
	});

	fastify.get('/getTemplateData', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { template_id } = request.query;

		/*
		if (!user_id) {
			return reply.status(400).send({ error: 'user_id is required' });
		}
		*/

		try {
			const query = `
      SELECT * FROM templates
      WHERE template_id = $1;
    `;
			const result = await client.query(query, [template_id]);

			return reply.status(200).send(result.rows);
		} catch (error) {
			console.error('Error retrieving template data:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve template data' });
		} finally {
			client.release();
		}
	});

	fastify.post('/submitTemplate', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { template_id, entries } = request.body;

		console.log('template_id:', template_id);
		console.log('template_entries:', entries);

		try {
			// Start transaction
			await client.query('BEGIN');

			// Delete all current entries in the templates table for the given template_id
			const deleteQuery = 'DELETE FROM templates WHERE template_id = $1';
			await client.query(deleteQuery, [template_id]);

			// Insert each entry from the request body.
			// Notice that we no longer include the "shift_id" column.
			const insertQuery = `
      INSERT INTO templates (
        template_id, 
        shift_type_id, 
        weekday, 
        start_time, 
        end_time
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

			for (const entry of entries) {
				await client.query(insertQuery, [
					template_id,
					entry.shift_type_id,
					entry.weekday,
					entry.start_time,
					entry.end_time,
				]);
			}

			// Commit the transaction if all queries succeed
			await client.query('COMMIT');

			return reply.status(200).send({
				message: 'Template updated successfully',
			});
		} catch (error) {
			// Rollback the transaction if anything fails
			await client.query('ROLLBACK');
			console.error('Error updating template:', error);
			return reply.status(500).send({ error: 'Failed to update template' });
		} finally {
			client.release();
		}
	});

	fastify.post('/applyTemplate', async (request, reply) => {
		const client = await fastify.pg.connect();
		const { user_id, template_id, group_id, year, month } = request.body;

		console.log('user_id:', user_id);
		console.log('template_id:', template_id);
		console.log('group_id:', group_id);
		console.log('year:', year);
		console.log('month:', month);

		// Convert month to a two-digit string.
		const formattedMonth = month.toString().padStart(2, '0');
		console.log('formattedMonth:', formattedMonth);

		try {
			const query = `
  SELECT 
    t.*,
    st.name_long,
    st.name_short,
    sg.group_id,
    sg.name AS group_name
  FROM templates t
  JOIN shift_types st ON t.shift_type_id = st.shift_type_id
  JOIN schedule_groups sg ON sg.group_id = $2
  WHERE t.template_id = $1;
`;
			const result = await client.query(query, [template_id, group_id]);

			let template = result.rows;
			console.log('template', template);

			let test = generateEntries(template, year, month);
			console.log('test', test);

			return reply.status(200).send(test);

			//return reply.status(200).send(result.rows);
		} catch (error) {
			console.error('Error retrieving template data:', error);
			return reply
				.status(500)
				.send({ error: 'Failed to retrieve template data' });
		} finally {
			client.release();
		}
	});

	// Check if a given date string (YYYY-MM-DD) is not a holiday and log removed dates
	function checkDate(dateString) {
		const holiday = hd.isHoliday(dateString); // Use the string directly with Holidays

		if (!holiday) {
			return true; // Not a holiday
		}

		if (Array.isArray(holiday)) {
			// Check if any holiday is public, bank, or school
			const hasSpecialHoliday = holiday.some(
				(h) => h.type === 'public' || h.type === 'bank' || h.type === 'school'
			);
			if (hasSpecialHoliday) {
				console.log(
					`Removed date (holiday): ${dateString} - ${holiday
						.map((h) => h.name)
						.join(', ')}`
				);
			}
			return !hasSpecialHoliday;
		}

		// Single holiday check
		const isSpecialHoliday =
			holiday.type === 'public' ||
			holiday.type === 'bank' ||
			holiday.type === 'school';

		if (isSpecialHoliday) {
			console.log(`Removed date (holiday): ${dateString} - ${holiday.name}`);
		}

		return !isSpecialHoliday;
	}

	// Generate FullCalendar event objects for the specified month using the formattedData structure.
	function generateEntries(formattedData, year, month) {
		// Fully flatten formattedData regardless of its nesting depth.
		const flattenedData = formattedData.flat(Infinity);

		const daysInMonth = new Date(year, month, 0).getDate(); // Total days in the given month
		const events = [];

		// Loop through each day in the month.
		for (let day = 1; day <= daysInMonth; day++) {
			// Build a date string in the format YYYY-MM-DD
			const dateString = `${year}-${String(month).padStart(2, '0')}-${String(
				day
			).padStart(2, '0')}`;

			const date = new Date(dateString);
			const weekdayJS = date.getDay(); // 0 (Sunday) to 6 (Saturday)
			// Convert JavaScript weekday (0 for Sunday) to our expected format (1 for Monday ... 7 for Sunday)
			const weekday = weekdayJS === 0 ? 7 : weekdayJS;

			// Only create events if the date is not a holiday.
			if (checkDate(dateString)) {
				flattenedData.forEach((item) => {
					// If the weekday in the data matches the current day of the week...
					if (item.weekday === weekday) {
						// Build start and end ISO8601 strings by combining dateString with the time parts.
						const startDateTime = `${dateString}T${item.start_time}`;
						const endDateTime = `${dateString}T${item.end_time}`;

						// Create a unique UUID for this event.
						const uniqueEventId = uuidv4();

						events.push({
							id: uniqueEventId, // New unique identifier for the event
							title: item.name_short, // Short name as the title
							start: startDateTime,
							end: endDateTime,
							extendedProps: {
								description: `${item.name_long} from ${item.start_time} to ${item.end_time}`,
								template_id: item.template_id,
								shift_type_id: item.shift_type_id,
								group_id: item.group_id,
								group_name: item.group_name,
								weekday: item.weekday,
								start_time: item.start_time,
								end_time: item.end_time,
							},
						});
					}
				});
			}
		}

		return events;
	}
}

module.exports = routes;
