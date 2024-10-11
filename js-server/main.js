const fastify = require('fastify');
const cors = require('@fastify/cors');
const cookie = require('@fastify/cookie');
const jwt = require('@fastify/jwt');
const fastifyStatic = require('@fastify/static');
const underPressure = require('@fastify/under-pressure');
const rateLimit = require('@fastify/rate-limit');
const os = require('os');
const logger = require('./logger');
const path = require('path');

const { getAssignedSlots } = require('./functions/createFiles');
const { generateICSFiles } = require('./functions/createFiles');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET;

let totalRequests = 0;
let inFlightRequests = 0;
let totalProcessingTime = 0;
const IGNORE_REQUESTS_THRESHOLD = 15; // Number of requests to ignore

const app = fastify({
	logger: false,
});

app.register(cookie);
app.register(jwt, {
	secret: JWT_SECRET,
	cookie: {
		cookieName: 'authToken',
		signed: false,
	},
});

// GLOBAL CORS
app.register(cors, {
	origin: CORS_ORIGIN,
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.addHook('preParsing', async (request, reply, payload) => {
	if (request.headers['content-type'] === 'application/json') {
		let rawBody = '';
		payload.on('data', (chunk) => {
			rawBody += chunk;
		});
		payload.on('end', () => {
			try {
				request.body = JSON.parse(rawBody);
			} catch (err) {
				reply.code(400).send({ message: 'Invalid JSON' });
			}
		});
	}
});

app.register(rateLimit, {
	max: 150,
	timeWindow: '1 minute',
});

// DATABASE CONNECTION
app.register(require('./connector'));

// Routes
app.register(require('./routes/authentication'));
app.register(require('./routes/admin'));
app.register(require('./routes/schedule'));
app.register(require('./routes/status'));
app.register(require('./routes/webhook'));
app.register(require('./routes/ical'), {
	hook: 'preHandler',
	options: {
		cors: {
			origin: '*',
			credentials: false,
			allowedHeaders: ['Content-Type'],
			methods: ['GET', 'OPTIONS'],
		},
	},
});

app.register(underPressure, {
	maxEventLoopDelay: 1500, // Tolerance for event loop delay (1.5s)
	maxHeapUsedBytes: 300 * 1024 * 1024, // Heap memory limit 300MB
	maxRssBytes: 600 * 1024 * 1024, // Resident Set Size (RSS) 600MB
	exposeStatusRoute: true, // Expose the route with health info
	healthCheckInterval: 5000, // Runs health checks every 5 seconds
	healthCheck: async function () {
		try {
			const client = await app.pg.connect();
			await client.query('SELECT NOW()');
			client.release();
			return true; // Health check passed
		} catch (error) {
			app.log.error('Health check failed', error);
			return false; // Health check failed
		}
	},
	customError: function (status, eventLoopDelay, heapUsed, rss) {
		return {
			status: 'critical',
			message: 'Server performance is degraded',
			eventLoopDelay: `${eventLoopDelay}ms`,
			heapUsed: `${(heapUsed / 1024 / 1024).toFixed(2)} MB`,
			rss: `${(rss / 1024 / 1024).toFixed(2)} MB`,
			uptime: `${process.uptime().toFixed(2)} seconds`,
			suggestions: [
				'Consider increasing available memory',
				'Monitor event loop delay and optimize CPU-heavy tasks',
			],
		};
	},
});

app.register(fastifyStatic, {
	root: path.join(__dirname, './user_files'),
});

// Middleware
app.decorate('verifyJWT', async function (request, reply) {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});

app.addHook('onRequest', async (request, reply) => {
	// Increment total requests regardless
	totalRequests++;
	if (totalRequests > IGNORE_REQUESTS_THRESHOLD) {
		// Only track metrics after the 15th request
		inFlightRequests++;
		request.startTime = process.hrtime();
	}
});

app.addHook('onResponse', async (request, reply) => {
	if (totalRequests > IGNORE_REQUESTS_THRESHOLD) {
		const [seconds, nanoseconds] = process.hrtime(request.startTime);
		const timeInMillis = seconds * 1000 + nanoseconds / 1e6; // Convert hrtime to milliseconds
		totalProcessingTime += timeInMillis;
		inFlightRequests--;
	}
});

app.get('/detailed-status', async (request, reply) => {
	const memoryUsage = process.memoryUsage();
	const totalMemory = os.totalmem();
	const freeMemory = os.freemem();
	const loadAvg = os.loadavg();
	const numCores = os.cpus().length;

	const averageRequestTime =
		totalRequests > IGNORE_REQUESTS_THRESHOLD
			? totalProcessingTime / (totalRequests - IGNORE_REQUESTS_THRESHOLD)
			: 0;

	const loadPercentage1Min = (loadAvg[0] / numCores) * 100;
	const loadPercentage5Min = (loadAvg[1] / numCores) * 100;
	const loadPercentage15Min = (loadAvg[2] / numCores) * 100;

	const detailedMetrics = {
		totalRequests,
		inFlightRequests,
		averageRequestTime: `${averageRequestTime.toFixed(2)} ms`,
		memory: {
			totalMemory: `${(totalMemory / 1024 / 1024).toFixed(2)} MB`,
			freeMemory: `${(freeMemory / 1024 / 1024).toFixed(2)} MB`,
			usedMemory: `${((totalMemory - freeMemory) / 1024 / 1024).toFixed(2)} MB`,
			rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
			heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
			heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
			external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
		},
		systemLoad: {
			'1min': `${loadPercentage1Min.toFixed(2)}%`,
			'5min': `${loadPercentage5Min.toFixed(2)}%`,
			'15min': `${loadPercentage15Min.toFixed(2)}%`,
		},
	};

	return detailedMetrics;
});

app.listen({ port: PORT, host: HOST }, async function (err, address) {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});

app.addHook('onReady', async () => {
	const client = await app.pg.connect();
	try {
		const res = await client.query('SELECT NOW()');
		app.log.info(`PostgreSQL connected: ${res.rows[0].now}`);

		await client.query('LISTEN slots_change');
		await client.query('LISTEN user_slots_change');

		client.on('notification', async (msg) => {
			if (msg.channel === 'slots_change') {
				console.log('Received notification from slots:', msg.payload);
				const slots = await getAssignedSlots(app);
				await generateICSFiles(slots);
			}

			if (msg.channel === 'user_slots_change') {
				console.log('Received notification from user_slots:', msg.payload);
				const slots = await getAssignedSlots(app);
				await generateICSFiles(slots);
			}
		});
	} catch (err) {
		app.log.error('PostgreSQL connection error:', err);
		throw new Error('PostgreSQL connection is not established');
	}
});
