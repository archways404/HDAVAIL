//! OUTDATED - NEEDS TO BE UPDATED

async function fetchSchedule(pg, uuid) {
	const client = await pg.connect();
	try {
		let query = `SELECT * FROM get_user_slots($1)`;
		let schedule = await client.query(query, [uuid]);
		return schedule.rows;
	} catch (error) {
		console.error('Error creating user:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = { fetchSchedule };
