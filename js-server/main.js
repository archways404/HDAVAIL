const fastify = require('fastify');
const cors = require('@fastify/cors');
const cookie = require('@fastify/cookie');
const jwt = require('@fastify/jwt');
const fastifyStatic = require('@fastify/static');
const underPressure = require('@fastify/under-pressure');
const WebSocket = require('ws');
const rateLimit = require('@fastify/rate-limit');
const metrics = require('fastify-metrics');
const os = require('os');
const fs = require('fs');
const logger = require('./logger');
const path = require('path');

const { getAssignedSlots } = require('./functions/createFiles');
const { generateICSFiles } = require('./functions/createFiles');

require('dotenv').config({
	path:
		process.env.NODE_ENV === 'production'
			? '.env.production'
			: '.env.development',
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET;
const key = fs.readFileSync('../certificates/server-key.pem');
const cert = fs.readFileSync('../certificates/server-cert.pem');

const app = fastify({
	logger: false,
	https: {
		key,
		cert,
	},
});

app.register(cookie, {
	secret: JWT_SECRET,
	parseOptions: {
		httpOnly: true,
		sameSite: 'None',
		secure: process.env.NODE_ENV === 'production',
	},
});

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
app.register(require('./routes/statistics'));
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

app.register(metrics, {
	endpoint: '/metrics',
	blacklist: ['/healthcheck', '/favicon.ico'],
	metrics: {
		gauge: { enabled: true },
		counter: { enabled: true },
		histogram: { enabled: true },
		timing: { enabled: true },
	},
});

/* REQUEST DURATIONS
const requestDurations = [];

// Middleware to track request duration
app.addHook('onRequest', (request, reply, done) => {
	request.startTime = process.hrtime(); // Capture the start time
	done();
});

app.addHook('onResponse', (request, reply, done) => {
	const diff = process.hrtime(request.startTime); // Capture the end time
	const durationInMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds

	// Store the duration along with request details
	requestDurations.push({
		method: request.method,
		url: request.raw.url,
		statusCode: reply.statusCode,
		duration: durationInMs.toFixed(2) + 'ms',
		time: new Date().toISOString(),
	});

	// Log the request details for debugging
	console.log(`Request to ${request.raw.url} took ${durationInMs} ms`);

	done();
});

// Serve request duration data
app.get('/request-durations', (request, reply) => {
	reply.send(requestDurations);
});
*/

app.listen({ port: PORT, host: HOST }, async function (err, address) {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
});

// Move WebSocket setup outside app.listen
const wss = new WebSocket.Server({ server: app.server });

// Listen for WebSocket connections
wss.on('connection', (ws) => {
	console.log('Client connected via WebSocket');

	// Handle WebSocket messages
	ws.on('message', (message) => {
		console.log('Received message:', message);
		ws.send(`Echo: ${message}`);
	});

	// Handle WebSocket disconnection
	ws.on('close', () => {
		console.log('WebSocket client disconnected');
	});

	// Handle WebSocket errors
	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
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
