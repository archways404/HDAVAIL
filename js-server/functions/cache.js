let HDCache = null;

async function handleHDCache() {
	return HDCache;
}

async function updateHDCache(client) {
	try {
		let query = `SELECT * FROM get_user_slots()`;
		let schedule = await client.query(query);

		return schedule.rows;
	} catch (error) {
		console.error('Error fetching schedule:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = { handleHDCache, updateHDCache };

/*
async function handleHDCache(client) {
	try {
		if (HDCache != null) {
			return HDCache;
		} else {
			HDCache = await updateHDCache(client);
			return HDCache;
		}
	} catch (error) {
		console.error('Error:', error.message);
		throw error;
	}
}
*/
