async function routes(fastify, options) {
	// Helper function: Add a new status type
	const addStatusType = async (client, type, priority) => {
		const result = await client.query(
			'INSERT INTO status_types (type, priority) VALUES ($1, $2) RETURNING id',
			[type, priority]
		);
		return result.rows[0];
	};

	// Helper function: Get all status types
	const getAllStatusTypes = async (client) => {
		const result = await client.query('SELECT * FROM status_types');
		return result.rows;
	};

	// Helper function: Add a new status message
	const addStatusMessage = async (client, message, type, active) => {
		const result = await client.query(
			'INSERT INTO status (message, status_type, active) VALUES ($1, $2, $3) RETURNING status_id',
			[message, type, active]
		);
		return result.rows[0]; // result.rows[0].status_id will contain the inserted ID
	};

	// Helper function: Get all status messages
	const getAllStatusMessages = async (client) => {
		const result = await client.query(
			'SELECT s.*, st.type, st.priority FROM status s JOIN status_types st ON s.status_type = st.id'
		);
		return result.rows;
	};

	// Helper function: Get active status messages
	const getActiveStatusMessages = async (client) => {
		const result = await client.query(
			'SELECT s.*, st.type, st.priority FROM status s JOIN status_types st ON s.status_type = st.id WHERE s.active = true'
		);
		return result.rows;
	};

	// Helper function: Update a status message
	const updateStatusMessage = async (client, id, message, type, active) => {
		await client.query(
			'UPDATE status SET message = $1, status_type = $2, active = $3, updated = CURRENT_TIMESTAMP WHERE status_id = $4',
			[message, type, active, id]
		);
	};

	// Helper function: Deactivate a status message
	const deactivateStatusMessage = async (client, id) => {
		await client.query(
			'UPDATE status SET active = false, updated = CURRENT_TIMESTAMP WHERE status_id = $1',
			[id]
		);
	};

	// Helper function: Delete a status message
	const deleteStatusMessage = async (client, id) => {
		await client.query('DELETE FROM status WHERE status_id = $1', [id]);
	};

	// Route: Create a new status type
	fastify.post('/status-types', async (request, reply) => {
		const { type, priority } = request.body;
		const client = await fastify.pg.connect();

		try {
			const result = await addStatusType(client, type, priority);
			reply.send({ message: 'Status type created', id: result.id });
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Get all status types
	fastify.get('/status-types', async (request, reply) => {
		const client = await fastify.pg.connect();

		try {
			const types = await getAllStatusTypes(client);
			reply.send(types);
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Create a new status message
	fastify.post('/status', async (request, reply) => {
		const { message, type, active } = request.body;
		const client = await fastify.pg.connect();

		try {
			const result = await addStatusMessage(client, message, type, active);
			reply.send({ message: 'Status message created', id: result.status_id });
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Get all status messages
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

	// Route: Get active status messages
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

	// Route: Update a status message
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

	// Route: Deactivate a status message
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

	// Route: Delete a status message
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
