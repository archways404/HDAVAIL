const { hashPassword, comparePassword } = require('./salt');
const { writeToLogfile } = require('./logfileLogic');

async function getLoginInformation(client, username) {
	try {
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

async function login(client, username, password, ip) {
	try {
		const user = await getLoginInformation(client, username);
		const isPasswordValid = await comparePassword(password, user.password);

		if (!isPasswordValid) {
			throw new Error('Incorrect password');
		}
		writeToLogfile(ip, 'LOGIN', 'SUCCESS', username, 'Login successful');
		return user;
	} catch (error) {
		console.error('Login failed:', error.message);
		writeToLogfile(ip, 'LOGIN', 'FAILED', username, error.message);
		throw error;
	}
}

module.exports = { login };
