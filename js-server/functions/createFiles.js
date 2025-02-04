//! OUTDATED - NEEDS TO BE UPDATED

const fs = require('fs');
const path = require('path');
const ics = require('ics');

function groupByUsername(data) {
	return data.reduce((acc, slot) => {
		if (!acc[slot.username]) {
			acc[slot.username] = [];
		}
		acc[slot.username].push(slot);
		return acc;
	}, {});
}

async function generateICSFiles(data) {
	const groupedData = groupByUsername(data);
	const userFilesPath = path.join(__dirname, '../user_files/');

	// Check if the user_files directory exists and create it if not
	if (!fs.existsSync(userFilesPath)) {
		fs.mkdirSync(userFilesPath, { recursive: true });
	}

	for (const [username, slots] of Object.entries(groupedData)) {
		let events = slots.map((slot) => ({
			start: [
				new Date(slot.shift_date).getUTCFullYear(),
				new Date(slot.shift_date).getUTCMonth() + 1,
				new Date(slot.shift_date).getUTCDate(),
				parseInt(slot.start_time.split(':')[0]),
				parseInt(slot.start_time.split(':')[1]),
			],
			end: [
				new Date(slot.shift_date).getUTCFullYear(),
				new Date(slot.shift_date).getUTCMonth() + 1,
				new Date(slot.shift_date).getUTCDate(),
				parseInt(slot.end_time.split(':')[0]),
				parseInt(slot.end_time.split(':')[1]),
			],
			title: slot.shift_type,
			description: `${slot.shift_type}`,
			location: slot.shift_type,
			url: 'https://software404.org', // TODO - FIX THE LINK
			status: 'CONFIRMED',
			organizer: { name: 'mainframeMAU', email: 'mainframeMAU@gmx.com' },
		}));

		ics.createEvents(events, (error, value) => {
			if (error) {
				console.error(`Error creating events for ${username}:`, error);
				return;
			}
			const filePath = path.join(userFilesPath, `${username}.ical`);
			fs.writeFile(filePath, value, (err) => {
				if (err) {
					console.error(`Failed to write ICS file for ${username}:`, err);
				} else {
					console.log(`ICS file created for ${username} at ${filePath}`);
				}
			});
		});
	}
}

async function getAssignedSlots(fastify) {
	const client = await fastify.pg.connect();
	try {
		const result = await client.query('SELECT * FROM get_assigned_slots();');
		return result.rows;
	} catch (error) {
		fastify.log.error(error);
		throw new Error('Database query failed');
	} finally {
		client.release();
	}
}

module.exports = { getAssignedSlots, generateICSFiles };
