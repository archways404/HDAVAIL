const fastifyPlugin = require('fastify-plugin');
require('dotenv').config();

async function connector(fastify, options) {
	fastify.register(require('@fastify/postgres'), {
		connectionString: process.env.POSTGRES_URI,
	});
}

module.exports = fastifyPlugin(connector);
