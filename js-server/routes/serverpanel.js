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
					const { stdout, stderr } = await execPromise('git pull --ff-only');
					if (stderr) {
						throw new Error(stderr);
					}
					fastify.log.info('Git pull successful:', stdout);

					// Step 2: Reinstall dependencies (if package.json changed)
					await execPromise('pnpm install --frozen-lockfile');
					fastify.log.info('Dependencies updated');

					// Step 3: Send response before restart
					reply.send({ message: 'Update successful. Server is restarting...' });

					// Step 4: Restart PM2 process
					setTimeout(() => {
						exec('pm2 restart api', (error, stdout, stderr) => {
							if (error) {
								console.error('Failed to restart PM2 process:', error.message);
							} else {
								console.log('PM2 restart successful:', stdout);
							}
						});
					}, 1000);
				} else {
					reply.status(403).send({ message: 'RESTRICTED' });
				}
			} catch (error) {
				fastify.log.error('Update failed:', error.message);
				console.log('Update failed:', error.message);
				reply
					.status(500)
					.send({ error: 'Update failed. Check server logs for details.' });
			}
		}
	);

	fastify.get('/update-test', async (request, reply) => {
		try {
			return reply.send({ message: 'check' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});
}

module.exports = routes;
