const crypto = require('crypto');

function generateResetToken() {
	// Generate a 32-byte random token
	return crypto.randomBytes(32).toString('hex');
}

module.exports = { generateResetToken };
