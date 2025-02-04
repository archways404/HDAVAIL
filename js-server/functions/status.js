//! OUTDATED - NEEDS TO BE UPDATED

// Add a new status message
async function addStatusMessage(client, message, type, active = true) {
	const result = await client.query(
		`INSERT INTO status_messages (message, type, active) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
		[message, type, active]
	);
	return result.rows[0];
}

// Get all status messages
async function getAllStatusMessages(client) {
	const result = await client.query(
		`SELECT * FROM status_messages ORDER BY created_at DESC`
	);
	return result.rows;
}

// Get active status messages
async function getActiveStatusMessages(client) {
	const result = await client.query(
		`SELECT * FROM status_messages WHERE active = true ORDER BY created_at DESC`
	);
	return result.rows;
}

// Update an existing status message
async function updateStatusMessage(client, id, message, type, active) {
	await client.query(
		`UPDATE status_messages 
         SET message = $1, type = $2, active = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
		[message, type, active, id]
	);
}

// Deactivate a status message
async function deactivateStatusMessage(client, id) {
	await client.query(
		`UPDATE status_messages 
         SET active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
		[id]
	);
}

// Delete a status message
async function deleteStatusMessage(client, id) {
	await client.query(`DELETE FROM status_messages WHERE id = $1`, [id]);
}

module.exports = {
	addStatusMessage,
	getAllStatusMessages,
	getActiveStatusMessages,
	updateStatusMessage,
	deactivateStatusMessage,
	deleteStatusMessage,
};
