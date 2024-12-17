const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function routes(fastify, options) {
	fastify.post(
		'/update',
		{ preValidation: fastify.verifyJWT },
		async (request, reply) => {
			try {
				const user = request.user;
				if (user.type === 'admin' || user.type === 'maintainer') {
					console.log('valid');
					// Step 1: Perform 'git pull'
					const { stdout, stderr } = await execPromise('git pull');
					if (stderr) {
						throw new Error(stderr);
					}
					fastify.log.info('Git pull successful:', stdout);

					// Step 2: Send response before shutdown
					reply.send({ message: 'Update successful. Server is restarting...' });

					// Step 3: Gracefully shut down the server
					await fastify.close();
					process.exit(0); // Exit to allow the process manager to restart the app
				} else {
					reply.send({ message: 'RESTRICTED' });
				}
			} catch (error) {
				fastify.log.error('Update failed:', error.message);
				reply
					.status(500)
					.send({ error: 'Update failed. Check server logs for details.' });
			}
		}
	);

	fastify.get('/update-test', async (request, reply) => {
		try {
			return reply.send({ message: 'new version!' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
