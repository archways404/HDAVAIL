const path = require('path');
const fs = require('fs');

const {
	getAssignedSlots,
	generateICSFiles,
} = require('../functions/createFiles');

async function routes(fastify, options) {
	// SERVE THE FILES
	fastify.get('/ical/:username', async (request, reply) => {
		const { username } = request.params;

		const filePath = path.join(__dirname, '../user_files', `${username}.ical`);
		if (fs.existsSync(filePath)) {
			return reply.sendFile(`${username}.ical`);
		} else {
			return reply.status(404).send({ error: 'File not found' });
		}
	});

	// MANUALLY REFRESH THE FILES
	fastify.get('/generate-files', async (request, reply) => {
		try {
			const slots = await getAssignedSlots(fastify);
			await generateICSFiles(slots);
			reply.send({ message: 'ICS files generated successfully' });
		} catch (error) {
			reply.status(500).send({ error: 'Could not generate ICS files' });
		}
	});
}

module.exports = routes;
