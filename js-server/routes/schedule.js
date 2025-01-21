const { createSchedule } = require('../functions/createSchedule');
const { fetchSchedule } = require('../functions/fetchSchedule');

const { startRequest } = require('../functions/processingTime');
const { endRequest } = require('../functions/processingTime');
const { calculateRequest } = require('../functions/processingTime');
const { fetchDataStart } = require('../functions/processingTime');
const { fetchDataEnd } = require('../functions/processingTime');

const { updateHDCache } = require('../functions/cache');
const { handleHDCache } = require('../functions/cache');

async function routes(fastify, options) {
	fastify.addHook('onRequest', (request, reply, done) => {
		startRequest(request);
		done();
	});

	fastify.addHook('onResponse', (request, reply, done) => {
		request.sendTime = Date.now();
		endRequest(request);
		const times = calculateRequest(request);
		console.log(`Request stats: ${JSON.stringify(times)}`);
		done();
	});

	fastify.get('/scheduleTemplate', async (request, reply) => {
		try {
			const scheduleTemplate = createSchedule();
			return reply.send(scheduleTemplate);
		} catch (error) {
			console.error('Template error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to crate using template' });
		}
	});

	fastify.post('/createSchedule', async (request, reply) => {
		try {
			console.log('req.body', request.body);
		} catch (error) {
			console.error('Template error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to crate using template' });
		}
	});

	// View Schedule Route
	fastify.get('/viewSchedule', async (request, reply) => {
		try {
			const { uuid } = request.query;
			let globalSchedule;

			if (!uuid) {
				// Use the cache-handling function
				globalSchedule = await handleHDCache(fastify.pg);
			} else {
				// Fetch schedule for specific UUID
				try {
					globalSchedule = await fetchSchedule(fastify.pg, uuid);
				} catch (error) {
					console.error('Template error:', error.message);
					return reply
						.status(500)
						.send({ error: 'Failed to crate using template' });
				}
			}

			return reply.send(globalSchedule);
		} catch (error) {
			console.error('View schedule error:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch schedule' });
		}
	});

	// Get Active Shifts for a Schedule Group
	fastify.get('/getActiveShiftsForGroup', async (request, reply) => {
		try {
			const { group_id } = request.query;

			// Validate that `group_id` is provided
			if (!group_id) {
				return reply.status(400).send({ error: 'Group ID is required' });
			}

			// Query to fetch active shifts for the given group_id
			const query = `
			SELECT 
				shift_id, 
				shift_type_id, 
				assigned_to, 
				start_time, 
				end_time, 
				date, 
				schedule_group_id
			FROM 
				active_shifts
			WHERE 
				schedule_group_id = $1
		`;

			// Execute the query
			const { rows } = await fastify.pg.query(query, [group_id]);

			// Send the results back to the client
			return reply.send(rows);
		} catch (error) {
			console.error('Error fetching active shifts:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch active shifts' });
		}
	});

	// Get Schedule Groups for a User
	fastify.get('/getScheduleGroups', async (request, reply) => {
		try {
			const { user_id } = request.query;

			// Check if `user_id` is provided
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			// Query to fetch schedule groups for the user
			const query = `
			SELECT sg.group_id, sg.name, sg.description
			FROM account_schedule_groups as asg
			JOIN schedule_groups as sg
			ON asg.group_id = sg.group_id
			WHERE asg.user_id = $1
		`;

			// Execute the query
			const { rows } = await fastify.pg.query(query, [user_id]);

			// Respond with the schedule groups
			return reply.send(rows);
		} catch (error) {
			console.error('Get schedule groups error:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to fetch schedule groups' });
		}
	});
}

module.exports = routes;
