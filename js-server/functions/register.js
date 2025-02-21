const argon2 = require('argon2');

const { hashPassword, comparePassword } = require('./salt');
const { sendEmail } = require('./email');
const { generateResetToken } = require('./resetToken');
const { registerEmailGetPlainTextContent } = require('../models/registerEmail');
const { registerEmailGetHtmlContent } = require('../models/registerEmail');
const {
	forgotPasswordEmailGetPlainTextContent,
} = require('../models/forgotPasswordEmail');
const {
	forgotPasswordEmailGetHtmlContent,
} = require('../models/forgotPasswordEmail');

async function registerNewUser(first_name, email, resetToken) {
	try {
		const plainTextContent = registerEmailGetPlainTextContent(
			first_name,
			resetToken
		);
		const htmlContent = registerEmailGetHtmlContent(first_name, resetToken);

		await sendEmail(
			email,
			'R3DSYS Registration',
			plainTextContent,
			htmlContent
		);

		return 'success';
	} catch (error) {
		console.error('Failed to register user or send email:', error);
		return 'failed';
	}
}

async function createNewUser(client, email, first_name, last_name, role) {
	try {
		// Check if the user already exists
		const checkQuery = `SELECT 1 FROM account WHERE email = $1`;
		const checkResult = await client.query(checkQuery, [email]);

		if (checkResult.rowCount > 0) {
			console.log('User already exists.');
			return 'user exists';
		}

		// Generate a reset token
		const resetToken = generateResetToken();

		// Insert the new user
		const insertQuery = `
			INSERT INTO account (email, first_name, last_name, role, notification_email, recovery_key)
			VALUES ($1, $2, $3, $4, $5, $6)
		`;
		await client.query(insertQuery, [
			email,
			first_name,
			last_name,
			role,
			email,
			resetToken,
		]);

		console.log('User created successfully.');

		const formattedFirstName =
			first_name.charAt(0).toUpperCase() + first_name.slice(1).toLowerCase();

		// Optionally send an email to the user
		const emailStatus = await registerNewUser(
			formattedFirstName,
			email,
			resetToken
		);
		if (emailStatus === 'success') {
			console.log('Email sent!');
			return 'success';
		} else {
			console.log('Email not sent');
			return 'email failed';
		}
	} catch (error) {
		console.error('Error creating user:', error.message);
		throw error;
	} finally {
		client.release();
	}
}

async function userSetNewPassword(client, token, password) {
	try {
		// Step 1: Find user by recovery key
		const findUserQuery = `
			SELECT user_id, recovery_key
			FROM account
			WHERE recovery_key = $1
		`;
		const userResult = await client.query(findUserQuery, [token]);
		if (userResult.rowCount === 0) {
			return 'Invalid or expired token';
		}
		const user = userResult.rows[0];

		// Step 2: Validate password
		if (!password) {
			return 'Password is required';
		}

		// Step 3: Hash the new password
		const hashedPassword = await hashPassword(password);

		// Step 4: Update the user's password
		const updatePasswordQuery = `
			UPDATE account
			SET password = $1
			WHERE user_id = $2
		`;
		await client.query(updatePasswordQuery, [hashedPassword, user.user_id]);

		// Step 5: Generate a new unique recovery key
		let newRecoveryKey;
		let isUnique = false;

		do {
			newRecoveryKey = generateResetToken();

			// Check if the token already exists
			const checkQuery = `
				SELECT 1 FROM account WHERE recovery_key = $1
			`;
			const checkResult = await client.query(checkQuery, [newRecoveryKey]);

			// If no rows are returned, the token is unique
			isUnique = checkResult.rowCount === 0;
		} while (!isUnique);

		// Step 6: Update the recovery key for the user
		const refreshRecoveryKeyQuery = `
			UPDATE account
			SET recovery_key = $1
			WHERE user_id = $2
		`;
		await client.query(refreshRecoveryKeyQuery, [newRecoveryKey, user.user_id]);

		// Return success
		return 'success';
	} catch (error) {
		console.error(error);
		return error;
	} finally {
		client.release();
	}
}

async function forgotPasswordSendEmail(client, email) {
	try {
		// Step 1: Find user by email
		const user = await findUserByEmail(client, email);
		if (!user) {
			return 'User not found';
		}

		// Step 2: Generate a new unique recovery key
		let newRecoveryKey;
		let isUnique = false;

		do {
			newRecoveryKey = generateResetToken();

			// Check if the token already exists
			const checkQuery = `
				SELECT 1 FROM account WHERE recovery_key = $1
			`;
			const checkResult = await client.query(checkQuery, [newRecoveryKey]);

			// If no rows are returned, the token is unique
			isUnique = checkResult.rowCount === 0;
		} while (!isUnique);

		// Step 3: Update the recovery key for the user
		const updateRecoveryKeyQuery = `
			UPDATE account
			SET recovery_key = $1
			WHERE user_id = $2
		`;
		await client.query(updateRecoveryKeyQuery, [newRecoveryKey, user.user_id]);

		// Step 4: Send email with the new recovery key
		const plainTextContent = forgotPasswordEmailGetPlainTextContent(
			user.first_name,
			newRecoveryKey
		);
		const htmlContent = forgotPasswordEmailGetHtmlContent(
			user.first_name,
			newRecoveryKey
		);

		await sendEmail(email, 'Password Reset', plainTextContent, htmlContent);

		return 'success';
	} catch (error) {
		console.error('Error in forgotPasswordSendEmail:', error.message);
		return error;
	} finally {
		client.release();
	}
}

async function findUserByEmail(client, email) {
	const query = 'SELECT * FROM account WHERE email = $1';
	const result = await client.query(query, [email]);
	return result.rows[0];
}

async function findUserByResetToken(client, token) {
	console.log('token', token);
	const query = 'SELECT * FROM account WHERE recovery_key = $1';
	const result = await client.query(query, [token]);
	return result.rows[0];
}

async function updateUserPassword(client, userId, hashedPassword) {
	const query = 'UPDATE users SET password = $1 WHERE uuid = $2';
	await client.query(query, [hashedPassword, userId]);
}

async function refreshResetToken(client, userId) {
	const newRecoveryKey = generateResetToken();
	const query = 'UPDATE account SET recovery_key = $1 WHERE user_id = $2';
	await client.query(query, [newRecoveryKey, userId]);
}

module.exports = {
	createNewUser,
	findUserByResetToken,
	userSetNewPassword,
	forgotPasswordSendEmail,
};
