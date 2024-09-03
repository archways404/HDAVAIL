const fs = require('fs');
const path = require('path');
const pino = require('pino');
const { multistream } = require('pino-multi-stream');
const pretty = require('pino-pretty');

// Create the Logs directory if it doesn't exist
const logDirectory = path.join(__dirname, 'Logs');
if (!fs.existsSync(logDirectory)) {
	fs.mkdirSync(logDirectory);
}

// Create a write stream for logging to file
const logStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), {
	flags: 'a',
});

// Custom pretty print formatter for the console
const consolePrettyStream = pretty({
	translateTime: 'SYS:standard',
	ignore: 'hostname,pid',
	singleLine: true,
	colorize: true,
	customPrettifiers: {
		reqId: (reqId) => `(${reqId})`,
		req: (req) => `[${req.method}] "${req.url}"`,
		res: (res) => `[${res.statusCode}]`,
		responseTime: (responseTime) => `${responseTime.toFixed(2)}ms`,
	},
	messageFormat: (log, messageKey) => {
		const msg = log[messageKey];
		const { reqId, req, res, responseTime } = log;
		if (reqId && req && res && responseTime !== undefined) {
			return `${msg} -> [${req.method}] "${req.url}" - (${reqId}) [${
				res.statusCode
			} - ${responseTime.toFixed(2)}ms]`;
		} else if (reqId && req && res) {
			return `${msg} -> [${req.method}] "${req.url}" - (${reqId}) [${res.statusCode}]`;
		} else if (msg && reqId) {
			return `${msg} -> (${reqId})`;
		}
		return msg;
	},
});

// Custom pretty print formatter for the logfile
const filePrettyStream = pretty({
	translateTime: 'SYS:standard',
	ignore: 'hostname,pid',
	singleLine: true, // Ensure single line for each log entry
	colorize: false, // No colors for file logs
	customPrettifiers: {
		reqId: (reqId) => `(${reqId})`,
		req: (req) => `[${req.method}] "${req.url}"`,
		res: (res) => `[${res.statusCode}]`,
		responseTime: (responseTime) => `${responseTime.toFixed(2)}ms`,
	},
	messageFormat: (log, messageKey) => {
		const msg = log[messageKey];
		const { reqId, req, res, responseTime } = log;
		if (reqId && req && res && responseTime !== undefined) {
			return `${msg} -> [${req.method}] "${req.url}" - (${reqId}) [${
				res.statusCode
			} - ${responseTime.toFixed(2)}ms]`;
		} else if (reqId && req && res) {
			return `${msg} -> [${req.method}] "${req.url}" - (${reqId}) [${res.statusCode}]`;
		} else if (msg && reqId) {
			return `${msg} -> (${reqId})`;
		}
		return msg;
	},
});

// Create the multistream logger
const logger = pino(
	{
		level: 'info',
		base: null, // To exclude hostname and pid from logs
		serializers: {
			req: (req) => ({
				method: req.method,
				url: req.url,
			}),
			res: (res) => ({
				statusCode: res.statusCode,
				responseTime: res.responseTime,
			}),
		},
	},
	multistream([
		{ stream: consolePrettyStream }, // Log to the console in pretty format
		{ stream: filePrettyStream.pipe(logStream) }, // Log to a file in the same pretty format
	])
);

module.exports = logger;
