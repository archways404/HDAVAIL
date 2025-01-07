const { login } = require('../functions/login');
const { createNewUser } = require('../functions/register');
const { findUserByResetToken } = require('../functions/register');
const { userSetNewPassword } = require('../functions/register');
const { forgotPasswordSendEmail } = require('../functions/register');
const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

const { createAuthLog } = require('../functions/db_logs');

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

	// LOGIN ROUTE
	fastify.post(
		'/login',
		{
			config: {
				rateLimit: {
					max: 150,
					timeWindow: '15 minutes',
					keyGenerator: (req) => req.body?.deviceId || req.ip,
				},
			},
		},
		async (request, reply) => {
			const { email, password, deviceId } = request.body;
			const ip = request.ip;

			if (!deviceId) {
				return reply.status(400).send({ message: 'Device ID is required' });
			}

			const client = await fastify.pg.connect();

			fetchDataStart(request);

			const user = await login(client, email, password, ip, deviceId);

			console.log('user:', user);
			console.log('ip:', ip);

			if (!user.error) {
				const authToken = fastify.jwt.sign(
					{
						uuid: user.user_id,
						email: user.email,
						role: user.role,
						first: user.first_name,
						last: user.last_name,
					},
					{ expiresIn: '15m' }
				);

				reply.setCookie('authToken', authToken, {
					httpOnly: true,
					sameSite: 'None',
					secure: true,
					path: '/',
				});

				await createAuthLog(client, user.user_id, ip, deviceId, true, null);

				fetchDataEnd(request);
				return reply.send({ message: 'Login successful' });
			} else if (user.error === 'Invalid password') {
				fetchDataEnd(request);
				return reply.send({
					message: 'Account does not exist or invalid password.',
				});
			} else if (user.error === 'Account with email does not exist') {
				fetchDataEnd(request);
				return reply.send({
					message: 'Account does not exist or invalid password.',
				});
			} else {
				fetchDataEnd(request);
				return reply.send({
					message: user.error,
				});
			}
		}
	);

	// CREATES A NEW USER AND SENDS AN INVITE VIA EMAIL
	fastify.post('/register', async (request, reply) => {
		const { email, first_name, last_name, role } = request.body;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await createNewUser(
				client,
				email,
				first_name,
				last_name,
				role
			);

			fetchDataEnd(request);

			if (status === 'success') {
				return reply.send({ message: 'User created successfully' });
			} else {
				return reply.send({ message: 'User creation failed' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// VERIFIES THAT THE SET PASSWORD LINK (TOKEN) IS VALID
	fastify.get('/setPassword', async (request, reply) => {
		const { token } = request.query;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const user = await findUserByResetToken(client, token);

			fetchDataEnd(request);

			if (!user) {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			}
			return reply.send({ message: 'Valid token' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// UPDATES PASSWORD VIA THE SET PASSWORD LINK (TOKEN)
	fastify.post('/setPassword', async (request, reply) => {
		const token = request.body.token;
		const password = request.body.password;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await userSetNewPassword(client, token, password);

			fetchDataEnd(request);

			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Password reset successful' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// VERIFIES THE PASSWORD RESET LINK (TOKEN) IS VALID
	fastify.get('/resetPassword', async (request, reply) => {
		const { token } = request.query;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const user = await findUserByResetToken(client, token);

			fetchDataEnd(request);

			if (!user) {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			}
			return reply.send({ message: 'Valid token' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// UPDATES PASSWORD VIA THE PASSWORD RESET LINK (TOKEN)
	fastify.post('/resetPassword', async (request, reply) => {
		const { token, password } = request.body;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await userSetNewPassword(client, token, password);

			fetchDataEnd(request);

			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Password reset successful' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// SEND EMAIL WITH PASSWORD RESET LINK
	fastify.post('/forgotPassword', async (request, reply) => {
		const email = request.body.email;
		const client = await fastify.pg.connect();
		try {
			fetchDataStart(request);

			const status = await forgotPasswordSendEmail(client, email);

			fetchDataEnd(request);

			if (status === 'Invalid or expired token') {
				console.error('Password reset error: Invalid or expired token');
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Email has been sent!' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	fastify.get(
		'/protected',
		{ preValidation: fastify.verifyJWT },
		async (request, reply) => {
			const user = request.user;
			console.log('user: ', user);
			const authToken = fastify.jwt.sign(
				{
					uuid: user.uuid,
					email: user.email,
					role: user.role,
					first: user.first,
					last: user.last,
				},
				{ expiresIn: '15m' }
			);

			reply.setCookie('authToken', authToken, {
				httpOnly: true,
				sameSite: 'None',
				secure: true,
				path: '/',
			});

			return reply.send({
				message: 'You are authenticated and token has been refreshed',
				user: user,
			});
		}
	);

	fastify.post('/logout', async (request, reply) => {
		reply.clearCookie('authToken', {
			path: '/',
			httpOnly: true,
			sameSite: 'None',
			secure: true,
		});

		return reply.send({ message: 'Logged out successfully' });
	});
};

module.exports = routes;
