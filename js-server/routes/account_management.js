async function routes(fastify, options) {
	// Fastify endpoint to get accounts
	fastify.get('/get-accounts', async (request, reply) => {
		const client = await fastify.pg.connect();
		try {
			// Query parameter (optional for filtering by type)
			const { type } = request.query;

			// Fetch users based on the query
			const users = await getUsers(client, type);

			// Send the response
			return reply.send(users);
		} catch (error) {
			console.error('Error fetching users:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch users' });
		} finally {
			client.release();
		}
	});

	fastify.get('/get-user', async (request, reply) => {
		const { uuid } = request.query;
		if (!uuid) {
			return reply.status(400).send({ error: 'UUID is required' });
		}
		const client = await fastify.pg.connect();
		try {
			// Fetch user details
			const userDetails = await getUserDetails(client, uuid);
			if (!userDetails) {
				return reply.status(404).send({ error: 'User not found' });
			}
			// Fetch account lockout details
			const lockoutDetails = await getAccountLockout(client, uuid);
			// Fetch schedule groups
			const scheduleGroups = await getScheduleGroups(client, uuid);
			// Combine and send the response
			const response = {
				userDetails,
				lockoutDetails,
				scheduleGroups,
			};
			return reply.send(response);
		} catch (error) {
			console.error('Error fetching user:', error.message);
			return reply.status(500).send({ error: 'Failed to fetch user' });
		} finally {
			client.release();
		}
	});

	fastify.post('/assignScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.body;
			if (!user_id || !group_id) {
				return reply
					.status(400)
					.send({ error: 'user_id and group_id are required' });
			}

			// Optionally, check if this relationship already exists to avoid duplicates.
			const checkQuery = `
      SELECT * FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
    `;
			const checkResult = await fastify.pg.query(checkQuery, [
				user_id,
				group_id,
			]);
			if (checkResult.rows.length > 0) {
				return reply
					.status(409)
					.send({ error: 'Schedule group already assigned to the user' });
			}

			const query = `
      INSERT INTO account_schedule_groups (user_id, group_id)
      VALUES ($1, $2)
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			return reply.status(201).send(rows[0]);
		} catch (error) {
			console.error('Error assigning schedule group:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to assign schedule group' });
		}
	});

	fastify.delete('/removeScheduleGroup', async (request, reply) => {
		try {
			const { user_id, group_id } = request.query;
			if (!user_id || !group_id) {
				return reply
					.status(400)
					.send({ error: 'user_id and group_id are required' });
			}

			const query = `
      DELETE FROM account_schedule_groups
      WHERE user_id = $1 AND group_id = $2
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id, group_id]);
			if (rows.length === 0) {
				return reply
					.status(404)
					.send({ error: 'Schedule group assignment not found' });
			}
			return reply.send({ message: 'Schedule group removed successfully' });
		} catch (error) {
			console.error('Error removing schedule group:', error.message);
			return reply
				.status(500)
				.send({ error: 'Failed to remove schedule group' });
		}
	});

	fastify.post('/unlockAccount', async (request, reply) => {
		try {
			const { user_id } = request.body;
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			const query = `
      UPDATE account_lockout
      SET locked = false,
          failed_attempts = 0,
          unlock_time = NULL
      WHERE user_id = $1
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Lockout record not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error unlocking account:', error.message);
			return reply.status(500).send({ error: 'Failed to unlock account' });
		}
	});

	fastify.post('/lockAccount', async (request, reply) => {
		try {
			const { user_id } = request.body;
			if (!user_id) {
				return reply.status(400).send({ error: 'User ID is required' });
			}

			const query = `
      UPDATE account_lockout
      SET locked = true,
          unlock_time = NOW() + interval '1000 years'
      WHERE user_id = $1
      RETURNING *
    `;
			const { rows } = await fastify.pg.query(query, [user_id]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'Lockout record not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error locking account:', error.message);
			return reply.status(500).send({ error: 'Failed to lock account' });
		}
	});

	fastify.post('/updateUserRole', async (request, reply) => {
		try {
			const { user_id, role } = request.body;
			if (!user_id || !role) {
				return reply
					.status(400)
					.send({ error: 'User ID and role are required' });
			}

			// Validate that the role is one of the allowed options.
			const allowedRoles = ['Admin', 'Worker', 'Maintainer'];
			if (!allowedRoles.includes(role)) {
				return reply.status(400).send({ error: 'Invalid role provided' });
			}

			const query = `
      UPDATE account
      SET role = $2
      WHERE user_id = $1
      RETURNING user_id, role
    `;
			const { rows } = await fastify.pg.query(query, [user_id, role]);
			if (rows.length === 0) {
				return reply.status(404).send({ error: 'User not found' });
			}
			return reply.send(rows[0]);
		} catch (error) {
			console.error('Error updating user role:', error.message);
			return reply.status(500).send({ error: 'Failed to update user role' });
		}
	});

	// Helper function to fetch users
	async function getUsers(client, type) {
		// Base query
		let query = `
        SELECT user_id, email, first_name, last_name, role 
        FROM account
    `;

		// Add a WHERE clause if 'type' is provided
		const values = [];
		if (type) {
			query += ` WHERE role = $1`;
			values.push(type);
		}

		// Execute the query
		const result = await client.query(query, values);

		// Return the rows
		return result.rows;
	}

	// Helper function to get user details (excluding sensitive fields)
	async function getUserDetails(client, uuid) {
		const query = `
        SELECT user_id, email, first_name, last_name, notification_email, role
        FROM account
        WHERE user_id = $1
    `;
		const result = await client.query(query, [uuid]);
		return result.rows[0];
	}

	// Helper function to get account lockout details
	async function getAccountLockout(client, uuid) {
		const query = `
        SELECT *
        FROM account_lockout
        WHERE user_id = $1
    `;
		const result = await client.query(query, [uuid]);
		return result.rows[0]; // Assuming one lockout record per user
	}

	// Helper function to get schedule groups for the user
	async function getScheduleGroups(client, uuid) {
		const query = `
        SELECT sg.group_id, sg.name
        FROM schedule_groups sg
        INNER JOIN account_schedule_groups asg ON sg.group_id = asg.group_id
        WHERE asg.user_id = $1
    `;
		const result = await client.query(query, [uuid]);
		return result.rows; // Return all associated schedule groups
	}

	/*
	// CREAETES A NEW USER AND SENDS AN INVITE VIA EMAIL
	fastify.post('/register', async (request, reply) => {
		const { username, email, type } = request.body;
		const client = await fastify.pg.connect();
		const status = await createNewUser(client, username, email, type);

		if (status === 'success') {
			return reply.send({ message: 'User created successfully' });
		} else {
			return reply.send({ message: 'User creation failed' });
		}
	});

	// VERIFIES THAT THE SET PASSWORD LINK (TOKEN) IS VALID
	fastify.get('/setPassword', async (request, reply) => {
		const { token } = request.query;
		console.log(token);
		const client = await fastify.pg.connect();
		try {
			const user = await findUserByResetToken(client, token);
			if (!user) {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			}
			return reply.send({ message: 'Valid token' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// UPDATES PASSWORD VIA THE SET PASSWORD LINK (TOKEN)
	fastify.post('/setPassword', async (request, reply) => {
		const token = request.body.token;
		const password = request.body.password;
		const client = await fastify.pg.connect();
		try {
			const status = await userSetNewPassword(client, token, password);
			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Password reset successful' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// VERIFIES THE PASSWORD RESET LINK (TOKEN) IS VALID
	fastify.get('/resetPassword', async (request, reply) => {
		const { token } = request.query;
		console.log(token);
		const client = await fastify.pg.connect();
		try {
			const user = await findUserByResetToken(client, token);
			if (!user) {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			}
			return reply.send({ message: 'Valid token' });
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		} finally {
			client.release();
		}
	});

	// UPDATES PASSWORD VIA THE PASSWORD RESET LINK (TOKEN)
	fastify.post('/resetPassword', async (request, reply) => {
		const { token, password } = request.body;
		const client = await fastify.pg.connect();
		try {
			const status = await userSetNewPassword(client, token, password);
			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Password reset successful' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	// SEND EMAIL WITH PASSWORD RESET LINK
	fastify.post('/forgotPassword', async (request, reply) => {
		const email = request.body.email;
		const client = await fastify.pg.connect();
		try {
			const status = await forgotPasswordSendEmail(client, email);
			if (status === 'Invalid or expired token') {
				return reply.status(400).send({ message: 'Invalid or expired token' });
			} else if (status === 'Password is required') {
				return reply.status(400).send({ message: 'Password is required' });
			} else if (status === 'success') {
				return reply.send({ message: 'Email has been sent!' });
			} else {
				return reply.status(500).send({ message: 'Internal server error' });
			}
		} catch (error) {
			console.error(error);
			return reply.status(500).send({ message: 'Internal server error' });
		}
	});

	fastify.get(
		'/protected',
		{ preValidation: fastify.verifyJWT },
		async (request, reply) => {
			const user = request.user;
			const authToken = fastify.jwt.sign(
				{ uuid: user.uuid, username: user.username, type: user.type },
				{ expiresIn: '15m' }
			);

			reply.setCookie('authToken', authToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				path: '/',
			});

			return reply.send({
				message: 'You are authenticated and token has been refreshed',
				user: user,
			});
		}
	);

	// Logout route in your server (Fastify)
	fastify.get('/logout', async (request, reply) => {
		// Clear the authToken cookie
		reply.clearCookie('authToken', {
			path: '/',
			httpOnly: true,
		});

		return reply.send({ message: 'Logged out successfully' });
  });
  */
}

module.exports = routes;
