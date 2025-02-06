const Holidays = require('date-holidays');
const hd = new Holidays('SE');
const { v4: uuidv4 } = require('uuid');

async function routes(fastify, options) {
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
