const { list_slot_types } = require('../functions/handleTemplates');
const { create_slot_type } = require('../functions/handleTemplates');
const { delete_slot_type } = require('../functions/handleTemplates');
const { get_template_entries } = require('../functions/handleTemplates');
const { get_templates_by_user } = require('../functions/handleTemplates');
const {
	create_template_with_entries,
} = require('../functions/handleTemplates');

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

	fastify.get('/list-slot-types', async (request, reply) => {
		const client = await fastify.pg.connect();
		try {
			const slot_types = await list_slot_types(client);
			return reply.send(slot_types);
		} catch (error) {
			console.error('Error fetching slot_types:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch slot_types' });
		}
	});

	fastify.post('/create-slot-type', async (request, reply) => {
		const { short_name, long_name } = request.body;
		const client = await fastify.pg.connect();
		try {
			const result = await create_slot_type(client, short_name, long_name);
			if (result) {
				return reply
					.code(201)
					.send({ message: 'Slot type created successfully', slot_id: result });
			} else {
				return reply.code(400).send({ message: 'Slot type creation failed' });
			}
		} catch (error) {
			console.error('Error creating slot type:', error.message);
			return reply.code(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	fastify.get('/delete-slot-type/:slot_id', async (request, reply) => {
		const { slot_id } = request.params;
		const client = await fastify.pg.connect();
		try {
			const isDeleted = await delete_slot_type(client, slot_id);
			if (isDeleted) {
				return reply
					.code(200)
					.send({ message: 'Slot type deleted successfully' });
			} else {
				return reply
					.code(404)
					.send({ message: 'Slot type not found or could not be deleted' });
			}
		} catch (error) {
			console.error('Error deleting slot type:', error.message);
			return reply.code(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	fastify.get('/template-entries/:template_id', async (request, reply) => {
		const { template_id } = request.params;
		const client = await fastify.pg.connect();
		try {
			const entries = await get_template_entries(client, template_id);
			if (entries.length > 0) {
				return reply.code(200).send(entries);
			} else {
				return reply
					.code(404)
					.send({ message: 'No template entries found for the provided ID' });
			}
		} catch (error) {
			console.error('Error fetching template entries:', error.message);
			return reply.code(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	fastify.get('/templates-by-user/:user_id', async (request, reply) => {
		const { user_id } = request.params;
		const client = await fastify.pg.connect();
		try {
			const templates = await get_templates_by_user(client, user_id);
			if (templates.length > 0) {
				return reply.code(200).send(templates);
			} else {
				return reply
					.code(404)
					.send({ message: 'No templates found for the provided user ID' });
			}
		} catch (error) {
			console.error('Error fetching templates by user:', error.message);
			return reply.code(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	fastify.post('/create-template-with-entries', async (request, reply) => {
		const { owner_id, template_name, private_status, entries } = request.body;
		const client = await fastify.pg.connect();
		try {
			const result = await create_template_with_entries(
				client,
				owner_id,
				template_name,
				private_status,
				entries
			);
			if (result) {
				return reply.code(201).send({
					message: 'Template with entries created successfully',
					template_id: result.template_id,
				});
			} else {
				return reply
					.code(400)
					.send({ message: 'Failed to create template with entries' });
			}
		} catch (error) {
			console.error('Error creating template with entries:', error.message);
			return reply.code(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
