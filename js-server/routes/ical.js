const {
	getAssignedSlots,
	generateICSFiles,
} = require('../functions/createFiles');

async function routes(fastify, options) {
	// SERVE THE FILES
	fastify.get('/ical/:userid', async (request, reply) => {
		const { userid } = request.params;

		const filePath = path.join(__dirname, '../user_files', `${userid}.ical`);
		if (fs.existsSync(filePath)) {
			return reply.sendFile(`${userid}.ical`);
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
