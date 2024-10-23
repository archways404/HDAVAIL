async function fetchHDCache(client) {
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

module.exports = { fetchHDCache };
