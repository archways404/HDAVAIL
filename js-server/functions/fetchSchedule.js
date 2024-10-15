async function fetchSchedule(client, uuid) {
	try {
		let query;
		let schedule;
		if (uuid != null) {
			query = `SELECT * FROM get_user_slots($1)`;
			schedule = await client.query(query, [uuid]);
		} else {
			query = `SELECT * FROM get_user_slots()`;
			schedule = await client.query(query);
		}
		return schedule.rows;
	} catch (error) {
		console.error('Error creating user:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = { fetchSchedule };
