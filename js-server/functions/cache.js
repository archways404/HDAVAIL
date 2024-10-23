const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expires in 3600 seconds (1 hour)

// A constant key to represent the "fetching" state in the cache
const CACHE_UPDATING_KEY = 'updating'; // This will be a temporary value indicating an update is in progress

// Function to handle cache retrieval
async function handleHDCache(pg) {
	try {
		while (true) {
			const cacheStatus = cache.get('schedule');

			// If the cache is marked as updating, wait for it to be updated
			if (cacheStatus === CACHE_UPDATING_KEY) {
				await new Promise((resolve) => setTimeout(resolve, 100)); // Wait 100ms and check again
				continue; // Loop again to check the cache
			}

			// Return the cached data if it's valid
			if (cacheStatus) {
				return cacheStatus;
			} else {
				// If the cache is empty, fetch new data and cache it
				const client = await pg.connect();
				try {
					return await fetchAndCache(client);
				} finally {
					client.release(); // Ensure the client is released
				}
			}
		}
	} catch (error) {
		console.error('Error retrieving cached data:', error.message);
		throw error;
	}
}

// Function to fetch new data and update the cache
async function fetchAndCache(client) {
	try {
		// Mark the cache as "updating" to indicate that a fetch is in progress
		cache.set('schedule', CACHE_UPDATING_KEY);

		// Fetch fresh data from the database
		let query = `SELECT * FROM get_user_slots()`;
		let schedule = await client.query(query);

		// Update the cache with the new data after fetching
		cache.set('schedule', schedule.rows);
		return schedule.rows;
	} catch (error) {
		console.error('Error fetching new schedule data:', error.message);
		throw error;
	}
}

module.exports = { handleHDCache, updateHDCache: fetchAndCache };
