async function createAuthLog(
	client,
	user_id,
	ip_address,
	fingerprint,
	success,
	error_message
) {
	try {
		const query = `
            INSERT INTO auth_logs (user_id, ip_address, fingerprint, success, error_message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
		const values = [
			user_id,
			ip_address,
			fingerprint,
			success,
			error_message || null,
		];

		const result = await client.query(query, values);
		return result.rows[0]; // Return the newly created log entry
	} catch (error) {
		console.error('Error creating auth log:', error.message);
		throw error;
	}
}

async function createGeneralLog(
	client,
	user_id,
	action_type,
	success,
	error_message,
	creation_method
) {
	try {
		const query = `
            INSERT INTO general_logs (user_id, action_type, success, error_message, creation_method)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
		const values = [
			user_id,
			action_type,
			success,
			error_message || null,
			creation_method,
		];

		const result = await client.query(query, values);
		return result.rows[0]; // Return the newly created log entry
	} catch (error) {
		console.error('Error creating general log:', error.message);
		throw error;
	}
}

module.exports = { createAuthLog, createGeneralLog };
