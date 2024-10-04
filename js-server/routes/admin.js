const { getUsers } = require('../functions/search');
const { getUserWithUUID } = require('../functions/search');

async function routes(fastify, options) {
	fastify.get('/get-accounts', async (request, reply) => {
		const client = await fastify.pg.connect();
		try {
			const { type } = request.query;
			const users = await getUsers(client, type);
			return reply.send(users);
		} catch (error) {
			console.error('Error fetching users:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch users' });
		}
	});

	fastify.get('/get-user', async (request, reply) => {
		const { uuid } = request.query;
		if (!uuid) {
			return reply.status(400).send({ error: 'UUID is required' });
		}
		const client = await fastify.pg.connect();
		try {
			const user = await getUserWithUUID(client, uuid);
			return reply.send(user);
		} catch (error) {
			console.error('Error fetching user:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch user' });
		}
	});

	/*
	// CREAETES A NEW USER AND SENDS AN INVITE VIA EMAIL
	fastify.post('/register', async (request, reply) => {
		const { username, email, type } = request.body;
		const client = await fastify.pg.connect();
		const status = await createNewUser(client, username, email, type);

		if (status === 'success') {
			return reply.send({ message: 'User created successfully' });
		} else {
			return reply.send({ message: 'User creation failed' });
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
				secure: process.env.NODE_ENV === 'production',
				path: '/',
			});

			return reply.send({
				message: 'You are authenticated and token has been refreshed',
				user: user,
			});
		}
	);

	// Logout route in your server (Fastify)
	fastify.get('/logout', async (request, reply) => {
		// Clear the authToken cookie
		reply.clearCookie('authToken', {
			path: '/',
			httpOnly: true,
		});

		return reply.send({ message: 'Logged out successfully' });
  });
  */
}

module.exports = routes;
