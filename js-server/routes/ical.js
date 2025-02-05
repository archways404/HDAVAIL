const path = require('path');
const fs = require('fs');

async function routes(fastify, options) {
	// SERVE THE FILES
	fastify.get('/ical/:uuid', async (request, reply) => {
		const { uuid } = request.params;

		const filePath = path.join(__dirname, '../user_files', `${uuid}.ical`);
		if (fs.existsSync(filePath)) {
			return reply.sendFile(`${uuid}.ical`);
		} else {
			return reply.status(404).send({ error: 'File not found' });
		}
	});
}

module.exports = routes;
