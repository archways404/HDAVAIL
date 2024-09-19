const {
	addStatusMessage,
	updateStatusMessage,
	deactivateStatusMessage,
	getAllStatusMessages,
	getActiveStatusMessages,
	deleteStatusMessage,
} = require('../functions/status');

async function routes(fastify, options) {
	// Create a new status message
	fastify.post('/status', async (request, reply) => {
		const { message, type, active } = request.body;
		const client = await fastify.pg.connect();

		try {
			const result = await addStatusMessage(client, message, type, active);
			reply.send({ message: 'Status message created', id: result.id });
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Get all status messages (active and inactive)
	fastify.get('/status/all', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			const messages = await getAllStatusMessages(client);
			reply.send(messages);
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Get only active status messages
	fastify.get('/status/active', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			const messages = await getActiveStatusMessages(client);
			reply.send(messages);
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Update a status message
	fastify.put('/status/:id', async (request, reply) => {
		const { id } = request.params;
		const { message, type, active } = request.body;
		const client = await fastify.pg.connect();

		try {
			await updateStatusMessage(client, id, message, type, active);
			reply.send({ message: 'Status message updated' });
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Deactivate a status message
	fastify.put('/status/deactivate/:id', async (request, reply) => {
		const { id } = request.params;
		const client = await fastify.pg.connect();

		try {
			await deactivateStatusMessage(client, id);
			reply.send({ message: 'Status message deactivated' });
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Delete a status message
	fastify.delete('/status/:id', async (request, reply) => {
		const { id } = request.params;
		const client = await fastify.pg.connect();

		try {
			await deleteStatusMessage(client, id);
			reply.send({ message: 'Status message deleted' });
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
