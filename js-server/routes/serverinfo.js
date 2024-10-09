const os = require('os');

async function routes(fastify, options) {
	fastify.get('/detailed-status', async (request, reply) => {
		const { totalRequests, inFlightRequests, totalProcessingTime } = options;

		const memoryUsage = process.memoryUsage();
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const loadAvg = os.loadavg();
		const numCores = os.cpus().length;

const averageRequestTime = totalRequests
	? (totalProcessingTime / totalRequests).toFixed(2) // Keep two decimal points
	: 0;


		const loadPercentage1Min = (loadAvg[0] / numCores) * 100;
		const loadPercentage5Min = (loadAvg[1] / numCores) * 100;
		const loadPercentage15Min = (loadAvg[2] / numCores) * 100;

		const detailedMetrics = {
			totalRequests,
			inFlightRequests,
			averageRequestTime: `${averageRequestTime.toFixed(2)} ms`,
			memory: {
				totalMemory: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
				freeMemory: `${(freeMemory / 1024 / 1024).toFixed(2)} MB`,
				usedMemory: `${((totalMemory - freeMemory) / 1024 / 1024).toFixed(
					2
				)} MB`,
				rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
				heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
				heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
				external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
			},
			systemLoad: {
				'1min': `${loadPercentage1Min.toFixed(1)}%`,
				'5min': `${loadPercentage5Min.toFixed(1)}%`,
				'15min': `${loadPercentage15Min.toFixed(1)}%`,
			},
		};

		return detailedMetrics;
	});
}

module.exports = routes;
