const fs = require('fs');
const path = require('path');

function createLogfileIfNotExists() {
	const currentDate = new Date().toISOString().split('T')[0];
	const logfileName = `logfile_${currentDate}.log`;
	const logsDir = path.join(__dirname, '../logs');
	const logfilePath = path.join(logsDir, logfileName);

	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir, { recursive: true });
	}

	if (!fs.existsSync(logfilePath)) {
		fs.writeFileSync(logfilePath, '');
		console.log(`Log file created: ${logfilePath}`);
	} else {
		console.log(`Log file already exists: ${logfilePath}`);
	}

	return logfilePath;
}

// Function to write a message to the log file
function writeToLogfile(ip, action, status, account, reason) {
	const logfilePath = createLogfileIfNotExists();
	const now = new Date();
	const date = now.toISOString().split('T')[0];
	const time = now.toTimeString().split(' ')[0].slice(0, 5);

	const logEntry = `[${date}] [${time}] -> | IP ${ip} | ACTION ${action} | STATUS ${status} | \n ACCOUNT "${account}" | REASON "${reason}"\n`;

	try {
		fs.appendFileSync(logfilePath, logEntry);
		console.log(`Log entry added: ${logEntry.trim()}`);
	} catch (err) {
		console.error('Failed to write to log file:', err);
	}
}

// EXAMPLE USE CASE
// writeToLogfile(ip, 'LOGIN', 'SUCCESS', username, 'Login successful');
// writeToLogfile(ip, 'LOGIN', 'FAILED', username, error.message);

module.exports = { createLogfileIfNotExists, writeToLogfile };
