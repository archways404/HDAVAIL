const { getAllRequestLogs } = require('../functions/processingTime');
const { sortAllRequestLogs } = require('../functions/processingTime');

async function routes(fastify, options) {
	fastify.get('/statistics', async (request, reply) => {
		try {
			const allRequests = await getAllRequestLogs();
			const sortedRequests = await sortAllRequestLogs(allRequests);
			reply.send(sortedRequests);
		} catch (error) {
			console.error(error);
			reply.status(500).send({ message: 'Internal server error' });
		}
	});
}

module.exports = routes;
