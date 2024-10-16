const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache items for 10 minutes (600 seconds)

let cacheUpdating = false; // Flag to check if cache is being updated

// Function to update cache with new data
async function updateCache(key, fetchDataFunction) {
	// Check if the cache is already being updated
	if (cacheUpdating) {
		console.log('Cache update in progress, serving stale data');
		return;
	}

	cacheUpdating = true; // Set the flag to indicate cache is being updated
	try {
		const newData = await fetchDataFunction(); // Fetch updated data
		myCache.set(key, newData); // Update cache
		console.log(`Cache updated for ${key}`);
	} catch (error) {
		console.error(`Failed to update cache for ${key}:`, error);
	} finally {
		cacheUpdating = false; // Reset the flag after update
	}
}

// Simulated functions to fetch new data from the database
async function fetchNewScheduleA() {
	return { id: 'A', data: 'New Schedule A data' };
}

async function fetchNewScheduleB() {
	return { id: 'B', data: 'New Schedule B data' };
}

/*
// Example routes for Fastify
fastify.get('/scheduleA', async (request, reply) => {
	let cachedScheduleA = myCache.get('schedule_A');
	if (cachedScheduleA) {
		return reply.send(cachedScheduleA);
	}

	// If no cache available, update the cache with fresh data
	await updateCache('schedule_A', fetchNewScheduleA);
	cachedScheduleA = myCache.get('schedule_A');
	if (cachedScheduleA) {
		return reply.send(cachedScheduleA); // Serve the updated cache
	}

	return reply.code(404).send({ error: 'Schedule A not found' });
});

fastify.get('/scheduleB', async (request, reply) => {
	let cachedScheduleB = myCache.get('schedule_B');
	if (cachedScheduleB) {
		return reply.send(cachedScheduleB);
	}

	// If no cache available, update the cache with fresh data
	await updateCache('schedule_B', fetchNewScheduleB);
	cachedScheduleB = myCache.get('schedule_B');
	if (cachedScheduleB) {
		return reply.send(cachedScheduleB); // Serve the updated cache
	}

	return reply.code(404).send({ error: 'Schedule B not found' });
});

// Start the Fastify server
fastify.listen(3000, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server running at ${address}`);
});

*/
