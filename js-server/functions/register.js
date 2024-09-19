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

async function registerNewUser(username, email, resetToken) {
	try {
		const plainTextContent = registerEmailGetPlainTextContent(
			username,
			resetToken
		);
		const htmlContent = registerEmailGetHtmlContent(username, resetToken);

		await sendEmail(
			email,
			'HDAVAIL Registration',
			plainTextContent,
			htmlContent
		);

		return 'success';
	} catch (error) {
		console.error('Failed to register user or send email:', error);
		return 'failed';
	}
}

async function createNewUser(client, username, email, type) {
	try {
		const resetToken = generateResetToken();
		const query = `CALL create_user_if_not_exists($1, $2, $3, $4)`;
		await client.query(query, [username, email, type, resetToken]);
		console.log('User created successfully.');
		const emailStatus = await registerNewUser(username, email, resetToken);
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
		const user = await findUserByResetToken(client, token);
		if (!user) {
			return 'Invalid or expired token';
		}
		if (!password) {
			return 'Password is required';
		}
		const hashedPassword = await hashPassword(password);
		await updateUserPassword(client, user.uuid, hashedPassword);
		await refreshResetToken(client, user.uuid);
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
		const user = await findUserByEmail(client, email);
		if (!user) {
			return 'User not found';
		}
		const username = user.username;
		const resetToken = user.reset_token;
		const plainTextContent = forgotPasswordEmailGetPlainTextContent;
		const htmlContent = forgotPasswordEmailGetHtmlContent(username, resetToken);
		await sendEmail(
			email,
			'HDAVAIL Reset Password',
			plainTextContent,
			htmlContent
		);
		return 'success';
	} catch (error) {
		console.error(error);
		return error;
	} finally {
		client.release();
	}
}

async function findUserByEmail(client, email) {
	const query = 'SELECT * FROM users WHERE email = $1';
	const result = await client.query(query, [email]);
	return result.rows[0];
}

async function findUserByResetToken(client, token) {
	console.log('token', token);
	const query = 'SELECT * FROM users WHERE reset_token = $1';
	const result = await client.query(query, [token]);
	return result.rows[0];
}

async function updateUserPassword(client, userId, hashedPassword) {
	const query = 'UPDATE users SET password = $1 WHERE uuid = $2';
	await client.query(query, [hashedPassword, userId]);
}

async function refreshResetToken(client, userId) {
	const newResetToken = generateResetToken();
	const query = 'UPDATE users SET reset_token = $1 WHERE uuid = $2';
	await client.query(query, [newResetToken, userId]);
}

module.exports = {
	createNewUser,
	findUserByResetToken,
	userSetNewPassword,
	forgotPasswordSendEmail,
};
