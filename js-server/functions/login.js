const { hashPassword, comparePassword } = require('./salt');

async function getLoginInformation(client, username, password) {
	try {
		const userHashedPwd = await hashPassword(password);
		const result = await client.query('SELECT * FROM authenticate($1, $2)', [
			username,
			userHashedPwd,
		]);
		if (result.rowCount === 0) {
			throw new Error('User not found or password incorrect');
		} else if (result.rowCount > 1) {
			throw new Error('Multiple users found');
		} else {
			return result.rows[0];
		}
	} finally {
		client.release();
	}
}

async function login(client, username, password) {
	const user = await getLoginInformation(client, username, password);
	if (!user) {
		throw new Error('Incorrect password');
	} else {
		return user;
	}
}

module.exports = { login };

/* OLD CODE

const { hashPassword, comparePassword } = require('./salt');

async function get_login_information(client, email, accountType) {
	try {
		const result = await client.query('SELECT * FROM authenticate($1, $2)', [
			email,
			accountType,
		]);
		if (result.rowCount === 0) {
			throw new Error('User not found');
		} else if (result.rowCount > 1) {
			throw new Error('Multiple users found');
		} else {
			return result.rows[0];
		}
	} finally {
		client.release();
	}
}

async function login(client, email, password, accountType) {
	const user = await get_login_information(client, email, accountType);
	const isMatch = await comparePassword(password, user.password);
	if (!isMatch) {
		throw new Error('Incorrect password');
	} else {
		return user;
	}
}

module.exports = { login };

*/
