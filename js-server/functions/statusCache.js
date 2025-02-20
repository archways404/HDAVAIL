const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expires in 3600 seconds (1 hour)

// A constant key to represent the "fetching" state in the cache
const CACHE_UPDATING_KEY = 'updating'; // This will be a temporary value indicating an update is in progress

// Function to handle cache retrieval
async function handleStatusCache(pg) {
	try {
		while (true) {
			const cacheStatus = cache.get('status');

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
		cache.set('status', CACHE_UPDATING_KEY);

		// Fetch fresh data from the database where `visible = true` and order by `sort_order`
		let query = `SELECT * FROM status WHERE visible = TRUE ORDER BY sort_order ASC`;
		let statusEntries = await client.query(query);

		// Update the cache with the new data after fetching
		cache.set('status', statusEntries.rows);
		return statusEntries.rows;
	} catch (error) {
		console.error('Error fetching new status data:', error.message);
		throw error;
	}
}

module.exports = { handleStatusCache, updateStatusCache: fetchAndCache };
