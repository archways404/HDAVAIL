async function getUsers(client, type = null) {
	try {
		let query;
		let params = [];

		if (type) {
			query = `SELECT * FROM get_users_by_type($1)`;
			params = [type];
		} else {
			query = `SELECT * FROM get_users_by_type()`;
		}

		const results = await client.query(query, params);
		return results.rows;
	} catch (error) {
		console.error('Error fetching users:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

async function getUserWithUUID(client, uuid) {
	try {
		const query = `SELECT * FROM get_user_by_uuid($1)`;
		const results = await client.query(query, [uuid]);
		return results.rows;
	} catch (error) {
		console.error('Error fetching user:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = {
	getUsers,
	getUserWithUUID,
};
