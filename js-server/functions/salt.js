/*
const bcrypt = require('bcrypt');
require('dotenv').config();

async function hashPassword(password) {
	const saltRounds = Number(process.env.SALT);
	try {
		const salt = await bcrypt.genSalt(saltRounds);
		const hashedPassword = await bcrypt.hash(password, salt);
		return hashedPassword;
	} catch (error) {
		throw new Error('Error hashing password: ' + error.message);
	}
}

async function comparePassword(password, hashedPassword) {
	try {
		const isMatch = await bcrypt.compare(password, hashedPassword);
		return isMatch;
	} catch (error) {
		throw new Error('Error comparing password: ' + error.message);
	}
}

module.exports = { hashPassword, comparePassword };
*/

/* ARGON2 FOR HASHING (MUCH FASTER) */
const argon2 = require('argon2');
require('dotenv').config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});

async function hashPassword(password) {
	try {
		// Hash the password using argon2
		const hashedPassword = await argon2.hash(password, {
			type: argon2.argon2id, // Argon2id is a balanced version of Argon2
			timeCost: Number(process.env.TIME_COST) || 2, // Number of iterations (more iterations = more security but slower)
			memoryCost: Number(process.env.MEMORY_COST) || 1024, // Memory in KiB (more memory = more secure but slower)
			parallelism: Number(process.env.PARALLELISM) || 1, // Number of threads (higher is faster but consumes more resources)
		});
		return hashedPassword;
	} catch (error) {
		throw new Error('Error hashing password: ' + error.message);
	}
}

async function comparePassword(password, hashedPassword) {
	try {
		// Verify the password against the hashed version
		const isMatch = await argon2.verify(hashedPassword, password);
		return isMatch;
	} catch (error) {
		throw new Error('Error comparing password: ' + error.message);
	}
}

module.exports = { hashPassword, comparePassword };
