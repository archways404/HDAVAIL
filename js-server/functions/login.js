const { hashPassword, comparePassword } = require('./salt');
const { writeToLogfile } = require('./logfileLogic');

const argon2 = require('argon2'); // Ensure you have argon2 installed

async function login(client, email, password, ip, deviceid) {
	try {
		// Query for the user's information, including the stored password hash
		const userResult = await client.query(
			'SELECT user_id, password, first_name, last_name, role FROM account WHERE email = $1',
			[email]
		);

		if (userResult.rows.length === 0) {
			throw new Error('Account with email does not exist');
		}

		const user = userResult.rows[0];
		const storedHash = user.password;

		// Ensure an entry exists in the account_lockout table
		await client.query(
			`INSERT INTO account_lockout (user_id, failed_attempts, locked, unlock_time)
             VALUES ($1, 0, FALSE, NULL)
             ON CONFLICT (user_id) DO NOTHING`,
			[user.user_id]
		);

		// Check if the account is locked
		const lockoutResult = await client.query(
			`SELECT locked, unlock_time FROM account_lockout WHERE user_id = $1`,
			[user.user_id]
		);

		const lockout = lockoutResult.rows[0];
		if (lockout && lockout.locked) {
			const unlockTime = lockout.unlock_time;
			if (unlockTime && unlockTime > new Date()) {
				throw new Error(`Account is locked until ${unlockTime.toISOString()}`);
			}

			// If unlock_time has passed, reset the lockout
			await client.query(
				`UPDATE account_lockout 
                 SET locked = FALSE, failed_attempts = 0, unlock_time = NULL 
                 WHERE user_id = $1`,
				[user.user_id]
			);
		}

		// Verify the password using Argon2
		const isPasswordValid = await argon2.verify(storedHash, password);

		if (!isPasswordValid) {
			// Handle failed login attempt (increment failed_attempts, etc.)
			await client.query(
				`UPDATE account_lockout 
                 SET failed_attempts = failed_attempts + 1, last_failed_ip = $2, last_failed_time = CURRENT_TIMESTAMP 
                 WHERE user_id = $1`,
				[user.user_id, ip]
			);

			// Check for lockout after incrementing failed attempts
			const failedAttemptsResult = await client.query(
				`SELECT failed_attempts FROM account_lockout WHERE user_id = $1`,
				[user.user_id]
			);

			const failedAttempts = failedAttemptsResult.rows[0]?.failed_attempts || 0;
			if (failedAttempts >= 5) {
				const unlockTime = new Date(Date.now() + 1 * 60 * 1000); // 15 minutes from now
				await client.query(
					`UPDATE account_lockout 
                     SET locked = TRUE, unlock_time = $2 
                     WHERE user_id = $1`,
					[user.user_id, unlockTime]
				);
				throw new Error(
					`Account locked due to too many failed attempts. Unlock at ${unlockTime.toISOString()}`
				);
			}

			throw new Error('Invalid password');
		}

		// If successful, reset failed attempts and return user info
		await client.query(
			`UPDATE account_lockout 
             SET failed_attempts = 0, locked = FALSE, unlock_time = NULL 
             WHERE user_id = $1`,
			[user.user_id]
		);

		return {
			user_id: user.user_id,
			email,
			first_name: user.first_name,
			last_name: user.last_name,
			role: user.role,
		};
	} catch (error) {
		console.error('Login failed:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

module.exports = { login };

