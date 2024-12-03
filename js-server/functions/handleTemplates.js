async function list_slot_types(client) {
	try {
		const query = `SELECT * FROM list_slot_types()`;
		const result = await client.query(query);
		return result.rows;
	} catch (error) {
		console.error('Error fetching slot_types:', error.message);
		throw error;
	}
}

async function create_slot_type(client, short_name, long_name) {
	try {
		const query = `SELECT create_slot_type($1, $2) AS slot_id`;
		const result = await client.query(query, [short_name, long_name]);
		return result.rows[0]?.slot_id || null;
	} catch (error) {
		console.error('Error creating slot_type:', error.message);
		throw error;
	}
}

async function delete_slot_type(client, slot_id) {
	try {
		const query = `SELECT delete_slot_type($1)`;
		const result = await client.query(query, [slot_id]);
		return result.rowCount > 0; // True if deleted
	} catch (error) {
		console.error('Error deleting slot_type:', error.message);
		throw error;
	}
}

async function get_template_entries(client, template_id) {
	try {
		const query = `SELECT * FROM get_template_entries($1)`;
		const result = await client.query(query, [template_id]);
		return result.rows;
	} catch (error) {
		console.error('Error fetching template entries:', error.message);
		throw error;
	}
}

async function get_templates_by_user(client, user_id) {
	try {
		const query = `SELECT * FROM get_templates_by_user($1)`;
		const result = await client.query(query, [user_id]);
		return result.rows;
	} catch (error) {
		console.error('Error fetching templates:', error.message);
		throw error;
	}
}

async function create_template_with_entries(
	client,
	owner_id,
	template_name,
	private_status,
	entries
) {
	try {
		const query = `SELECT create_template_with_entries($1, $2, $3, $4::JSONB)`;
		const result = await client.query(query, [
			owner_id,
			template_name,
			private_status,
			JSON.stringify(entries),
		]);
		return result.rows[0];
	} catch (error) {
		console.error('Error creating template with entries:', error.message);
		throw error;
	}
}

module.exports = {
	list_slot_types,
	create_slot_type,
	delete_slot_type,
	get_template_entries,
	get_templates_by_user,
	create_template_with_entries,
};
