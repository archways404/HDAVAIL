const { handleStatusCache } = require('../functions/statusCache');

async function routes(fastify, options) {
	// Route: Get the displayed status messages
	fastify.get('/status', async (request, reply) => {
		try {
			// Use cached values instead of direct DB queries
			const cachedStatus = await handleStatusCache(fastify.pg);

			console.log('cachedStatus', cachedStatus);

			// Send the cached response
			reply.send(cachedStatus);
		} catch (error) {
			console.error('Error retrieving status:', error);
			reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// Route: Get the admin-view status messages
	fastify.get('/admin/status', async (request, reply) => {
		const client = await fastify.pg.connect(); // Connect to the database
		try {
			// Query to fetch ALL status messages (no filters)
			const query = `SELECT * FROM status ORDER BY sort_order ASC`;
			const statusEntries = await client.query(query);

			// Send the response with all rows
			reply.send(statusEntries.rows);
		} catch (error) {
			console.error('Error retrieving status:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release(); // Release the database connection
		}
	});

	// Route: Create a new status message
	fastify.post('/admin/new-status', async (request, reply) => {
		const { type, description, mode, color, visible, sort_order } =
			request.body; // Extract values
		const client = await fastify.pg.connect();

		try {
			const query = `
            INSERT INTO status (type, description, mode, color, visible, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING status_id;
        `;

			const values = [
				type,
				description,
				mode,
				color,
				visible ?? true,
				sort_order ?? 0,
			]; // Default visible=true, sort_order=0

			const result = await client.query(query, values);

			reply.send({
				message: 'Status message created',
				id: result.rows[0].status_id,
			});
		} catch (error) {
			console.error('Error inserting new status:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Update a status message
	fastify.put('/admin/update-status', async (request, reply) => {
		const { status_id, type, description, mode, color, visible, sort_order } =
			request.body;
		if (!status_id) {
			return reply.status(400).send({ message: 'status_id is required' });
		}

		const client = await fastify.pg.connect();

		try {
			const query = `
            UPDATE status
            SET 
                type = COALESCE($1, type),
                description = COALESCE($2, description),
                mode = COALESCE($3, mode),
                color = COALESCE($4, color),
                visible = COALESCE($5, visible),
                sort_order = COALESCE($6, sort_order),
                updated_at = CURRENT_TIMESTAMP
            WHERE status_id = $7
            RETURNING *;
        `;

			const values = [
				type,
				description,
				mode,
				color,
				visible,
				sort_order,
				status_id,
			];

			const result = await client.query(query, values);

			if (result.rowCount === 0) {
				return reply.status(404).send({ message: 'Status entry not found' });
			}

			reply.send({
				message: 'Status updated successfully',
				updated_status: result.rows[0],
			});
		} catch (error) {
			console.error('Error updating status:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Update a status order
	fastify.put('/admin/update-order', async (request, reply) => {
		const { updates } = request.body; // Expecting an array of { status_id, sort_order }

		if (!Array.isArray(updates) || updates.length === 0) {
			return reply.status(400).send({
				message: 'Invalid input: updates should be a non-empty array',
			});
		}

		const client = await fastify.pg.connect();

		try {
			await client.query('BEGIN'); // Start transaction

			// Update each status entry's sort_order
			for (const { status_id, sort_order } of updates) {
				if (!status_id || sort_order === undefined) {
					throw new Error(
						'Invalid update entry: Missing status_id or sort_order'
					);
				}

				const query = `
                UPDATE status
                SET sort_order = $1, updated_at = CURRENT_TIMESTAMP
                WHERE status_id = $2;
            `;

				await client.query(query, [sort_order, status_id]);
			}

			await client.query('COMMIT'); // Commit transaction

			reply.send({ message: 'Sort order updated successfully' });
		} catch (error) {
			await client.query('ROLLBACK'); // Rollback on error
			console.error('Error updating sort order:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Change visibility for a status message
	fastify.patch('/admin/status/:id', async (request, reply) => {
		const { id } = request.params;
		const client = await fastify.pg.connect();

		try {
			const query = `
            UPDATE status
            SET visible = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE status_id = $1
            RETURNING *;
        `;

			const result = await client.query(query, [id]);

			if (result.rowCount === 0) {
				return reply.status(404).send({ message: 'Status entry not found' });
			}

			reply.send({
				message: 'Status entry hidden successfully',
				updated_status: result.rows[0],
			});
		} catch (error) {
			console.error('Error hiding status entry:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// Route: Delete a status message
	fastify.delete('/admin/status/:id', async (request, reply) => {
		const { id } = request.params;
		const client = await fastify.pg.connect();

		try {
			const query = `DELETE FROM status WHERE status_id = $1 RETURNING *;`;
			const result = await client.query(query, [id]);

			if (result.rowCount === 0) {
				return reply.status(404).send({ message: 'Status entry not found' });
			}

			reply.send({ message: 'Status entry deleted successfully' });
		} catch (error) {
			console.error('Error deleting status entry:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;

/*
	// ✅ Route 1: Fetch from cache (Fast)
	fastify.get('/status1', async (request, reply) => {
		try {
			const start = process.hrtime(); // Start timer

			// Fetch cached data
			const cachedStatus = await handleStatusCache(fastify.pg);

			const end = process.hrtime(start); // End timer
			console.log(`⚡ Cached Fetch Time: ${end[0]}s ${end[1] / 1e6}ms`);

			reply.send(cachedStatus);
		} catch (error) {
			console.error('Error retrieving status from cache:', error);
			reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// ✅ Route 2: Fetch directly from PostgreSQL (Slower)
	fastify.get('/status2', async (request, reply) => {
		const client = await fastify.pg.connect();
		try {
			const start = process.hrtime(); // Start timer

			// Direct SQL query (No cache)
			const query = `SELECT * FROM status WHERE visible = TRUE ORDER BY sort_order ASC`;
			const statusEntries = await client.query(query);

			const end = process.hrtime(start); // End timer
			console.log(`🐢 Direct SQL Fetch Time: ${end[0]}s ${end[1] / 1e6}ms`);

			reply.send(statusEntries.rows);
		} catch (error) {
			console.error('Error retrieving status from database:', error);
			reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release(); // Always release DB connection
		}
	});
	*/
