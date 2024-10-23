const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache expires in 3600 seconds (1 hour)

// Function to handle cache retrieval
async function handleHDCache(client) {
	try {
		// Check if the data is already cached
		const cachedData = cache.get('schedule');
		if (cachedData) {
			return cachedData; // Return cached data if available
		} else {
			// If not cached, fetch data and cache it
			const schedule = await updateHDCache(client);
			cache.set('schedule', schedule); // Cache the result
			return schedule;
		}
	} catch (error) {
		console.error('Error retrieving cached data:', error.message);
		throw error;
	}
}

// Function to update cache with fresh data from the database
async function updateHDCache(client) {
	try {
		let query = `SELECT * FROM get_user_slots()`;
		let schedule = await client.query(query);

		// Cache the result after fetching
		cache.set('schedule', schedule.rows); // Update cache with fresh data
		return schedule.rows;
	} catch (error) {
		console.error('Error fetching schedule:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = { handleHDCache, updateHDCache };
