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
