const { login } = require('../functions/login');
const { createNewUser } = require('../functions/register');
const { findUserByResetToken } = require('../functions/register');
const { userSetNewPassword } = require('../functions/register');
const { forgotPasswordSendEmail } = require('../functions/register');

async function routes(fastify, options) {
	// LOGIN ROUTE
	fastify.post(
		'/login',
		{
			config: {
				rateLimit: {
					max: 15,
					timeWindow: '15 minutes',
					keyGenerator: (req) => req.body?.deviceId || req.ip,
				},
			},
		},
		async (request, reply) => {
			console.time('loginRequest');
			const { username, password, deviceId } = request.body;
			const ip = request.ip;

			if (!deviceId) {
				return reply.status(400).send({ message: 'Device ID is required' });
			}

			const client = await fastify.pg.connect();
			const user = await login(client, username, password, ip, deviceId);

			const authToken = fastify.jwt.sign(
				{ uuid: user.uuid, username: user.username, type: user.type },
				{ expiresIn: '15m' }
			);

			reply.setCookie('authToken', authToken, {
				httpOnly: true,
				sameSite: 'None', // Cross-origin
				secure: process.env.NODE_ENV === 'production',
				path: '/',
			});

			console.timeEnd('loginRequest');
			return reply.send({ message: 'Login successful' });
		}
	);

	// CREAETES A NEW USER AND SENDS AN INVITE VIA EMAIL
	fastify.post('/register', async (request, reply) => {
		const { username, first_name, last_name, email, type } = request.body;
		const client = await fastify.pg.connect();
		try {
			const status = await createNewUser(
				client,
				username,
				first_name,
				last_name,
				email,
				type
			);
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
		console.log(token);
		const client = await fastify.pg.connect();
		try {
			const user = await findUserByResetToken(client, token);
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
			const status = await userSetNewPassword(client, token, password);
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
		console.log(token);
		const client = await fastify.pg.connect();
		try {
			const user = await findUserByResetToken(client, token);
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
			const status = await userSetNewPassword(client, token, password);
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
			const status = await forgotPasswordSendEmail(client, email);
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
			const authToken = fastify.jwt.sign(
				{ uuid: user.uuid, username: user.username, type: user.type },
				{ expiresIn: '15m' }
			);

			reply.setCookie('authToken', authToken, {
				httpOnly: true,
				sameSite: 'None', // Allow cross-origin cookie clearing
				secure: process.env.NODE_ENV === 'production',
				path: '/',
			});

			return reply.send({
				message: 'You are authenticated and token has been refreshed',
				user: user,
			});
		}
	);

	fastify.post('/logout', async (request, reply) => {
		// Clear the authToken cookie

		reply.clearCookie('authToken', {
			path: '/',
			httpOnly: true,
			sameSite: 'None',
			secure: process.env.NODE_ENV === 'production', // Ensure it's only sent over HTTPS
		});

		/*
		// Optionally set an expired cookie to override the old one
		reply.setCookie('authToken', '', {
			path: '/',
			httpOnly: true,
			expires: new Date(0), // Set to a past date to force expiry
			sameSite: 'None',
			secure: process.env.NODE_ENV === 'production', // Ensure it's only sent over HTTPS
		});
		*/

		return reply.send({ message: 'Logged out successfully' });
	});
};

module.exports = routes;
