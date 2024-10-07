const { exec } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const getRawBody = require('raw-body');

const secret = process.env.WEBHOOK_SECRET || 'temp_test';

async function routes(fastify, options) {
	// Middleware to capture raw body for signature verification
	fastify.addHook('preValidation', async (request, reply) => {
		if (request.routerPath === '/webhook') {
			try {
				request.rawBody = await getRawBody(request.raw);
				console.log('Raw Body Captured:', request.rawBody.toString());
			} catch (err) {
				reply.status(500).send('Failed to process request');
			}
		}
	});

	// Function to verify the GitHub webhook signature
	function verifySignature(req, payload) {
		const signature = `sha256=${crypto
			.createHmac('sha256', secret)
			.update(payload)
			.digest('hex')}`;

		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(req.headers['x-hub-signature-256'] || '', 'utf8')
		);
	}

	fastify.post('/webhook', async (request, reply) => {
		try {
			// Get the raw body for signature verification
			const payload = request.rawBody ? request.rawBody.toString() : null;

			if (!payload) {
				return reply.status(400).send('Empty body or failed to read body');
			}

			// Verify webhook signature
			if (!verifySignature(request, payload)) {
				return reply.status(401).send('Invalid signature');
			}

			// Parse the payload after verifying the signature
			const body = JSON.parse(payload);

			// Check if the event is a push to the master branch
			if (body.ref === 'refs/heads/master') {
				const commitMessage = body.head_commit.message.toLowerCase();
				const ipAddress = request.ip;

				console.log(`Webhook received from IP ${ipAddress}`);
				console.log(`Commit message: ${commitMessage}`);

				if (commitMessage.includes('immediate deploy')) {
					// Immediate deployment
					console.log(
						'Immediate deploy requested, pulling from master branch...'
					);
					exec(
						'git -C /actual/path/to/your/repo pull origin master',
						(err, stdout, stderr) => {
							if (err) {
								console.error(`Exec error: ${err}`);
								return reply.status(500).send('Failed to pull code');
							}
							console.log(`stdout: ${stdout}`);
							console.log(`stderr: ${stderr}`);
							return reply.send('Immediate deployment successful');
						}
					);
				} else {
					// Schedule for 2 AM deploy
					console.log('Scheduled deploy for 2 AM');
					fs.writeFileSync('/tmp/deploy_at_2am', 'pending');
					return reply.send('Scheduled deploy for 2 AM');
				}
			} else {
				return reply.status(400).send('Not a master branch push');
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send('Internal Server Error');
		}
	});
}

module.exports = routes;

/* 
fastify.addHook('preValidation', async (request, reply) => {
		if (request.routerPath === '/webhook') {
			try {
				request.rawBody = await getRawBody(request.raw);
				console.log('Raw Body Captured:', request.rawBody);
			} catch (err) {
				reply.status(500).send('Failed to process request');
			}
		}
	});
  
  fastify.post('/webhook', async (request, reply) => {
		try {
			// No manual body handling, let Fastify handle JSON parsing automatically
			const body = request.body;

			if (!body) {
				return reply.status(400).send('Empty body or failed to read body');
			}

			console.log('Payload:', body);

			// Check if the event is a push to the master branch
			if (body.ref === 'refs/heads/master') {
				const commitMessage = body.head_commit.message.toLowerCase();
				const ipAddress = request.ip;

				console.log(`Webhook received from IP ${ipAddress}`);
				console.log(`Commit message: ${commitMessage}`);

				if (commitMessage.includes('immediate deploy')) {
					// Immediate deployment
					console.log(
						'Immediate deploy requested, pulling from master branch...'
					);
					exec(
						'git -C /path/to/your/repo pull origin master',
						(err, stdout, stderr) => {
							if (err) {
								console.error(`Exec error: ${err}`);
								return reply.status(500).send('Failed to pull code');
							}
							console.log(`stdout: ${stdout}`);
							console.log(`stderr: ${stderr}`);
							return reply.send('Immediate deployment successful');
						}
					);
				} else {
					// Schedule for 2 AM deploy
					console.log('Scheduled deploy for 2 AM');
					fs.writeFileSync('/tmp/deploy_at_2am', 'pending');
					return reply.send('Scheduled deploy for 2 AM');
				}
			} else {
				return reply.status(400).send('Not a master branch push');
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send('Internal Server Error');
		}
	});
*/
