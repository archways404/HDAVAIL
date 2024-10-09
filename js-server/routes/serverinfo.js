async function routes(fastify, options) {
	fastify.get('/detailed-status', async (request, reply) => {
		const memoryUsage = process.memoryUsage();
		const loadAvg = require('os').loadavg();
		const uptime = process.uptime();

		const statusInfo = {
			status: 'ok',
			memory: {
				rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
				heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
				heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
				external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
			},
			loadAverage: {
				'1min': loadAvg[0].toFixed(2),
				'5min': loadAvg[1].toFixed(2),
				'15min': loadAvg[2].toFixed(2),
			},
			uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(
				uptime % 60
			)} seconds`,
		};

		reply.send(statusInfo);
	});
}

module.exports = routes;
