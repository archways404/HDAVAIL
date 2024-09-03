const { login } = require('../functions/login');

async function routes(fastify, options) {
	fastify.post('/login', async (request, reply) => {
		const { username, password } = request.body;
		const client = await fastify.pg.connect();
		const user = await login(client, username, password);

		const authToken = fastify.jwt.sign(
			{ id: user.id, username: user.username },
			{ expiresIn: '1h' }
		);

		reply.setCookie('authToken', authToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			path: '/',
		});

		return reply.send({ message: 'Login successful' });
	});

	fastify.get(
		'/protected',
		{ preValidation: fastify.verifyJWT },
		async (request, reply) => {
			return reply.send({
				message: 'You are authenticated',
				user: request.user,
			});
		}
	);
}

module.exports = routes;
