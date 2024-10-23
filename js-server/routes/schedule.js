const { createSchedule } = require('../functions/createSchedule');
const { fetchSchedule } = require('../functions/fetchSchedule');

const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

const { updateHDCache } = require('../functions/cache');
const { handleHDCache } = require('../functions/cache');

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

	fastify.get('/scheduleTemplate', async (request, reply) => {
		try {
			const scheduleTemplate = createSchedule();
			return reply.send(scheduleTemplate);
		} catch (error) {
			console.error('Template error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to crate using template' });
		}
	});

	fastify.post('/createSchedule', async (request, reply) => {
		try {
			console.log('req.body', request.body);
		} catch (error) {
			console.error('Template error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to crate using template' });
		}
	});

	fastify.get('/viewSchedule', async (request, reply) => {
		try {
			const { uuid } = request.query;
			let globalSchedule;

			if (!uuid) {
				let HDCache = await handleHDCache();
				if (HDCache) {
					globalSchedule = HDCache;
				} else {
					const client = await fastify.pg.connect();
					globalSchedule = await updateHDCache(client);
				}
			} else {
				const client = await fastify.pg.connect();
				globalSchedule = await fetchSchedule(client, uuid);
				client.release();
			}

			return reply.send(globalSchedule);
		} catch (error) {
			console.error('View schedule error:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch schedule' });
		}
	});
}

module.exports = routes;
