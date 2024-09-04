const { hashPassword, comparePassword } = require('./salt');

async function getLoginInformation(client, username) {
	try {
		console.log('username:', username);
		const result = await client.query('SELECT * FROM users WHERE username=$1', [
			username,
		]);
		if (result.rowCount === 0) {
			throw new Error('User not found');
		}
		return result.rows[0];
	} finally {
		client.release();
	}
}

async function login(client, username, password) {
	try {
		const user = await getLoginInformation(client, username);
		const isPasswordValid = await comparePassword(password, user.password);

		if (!isPasswordValid) {
			throw new Error('Incorrect password');
		}
		return user;
	} catch (error) {
		console.error('Login failed:', error.message);
		throw error;
	}
}

module.exports = { login };
