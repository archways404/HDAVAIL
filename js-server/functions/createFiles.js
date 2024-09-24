const fs = require('fs');
const path = require('path');
const ics = require('ics');

async function generateICSFiles(data) {
	for (const slot of data) {
		const event = {
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
			url: '', // TODO - DIRECT LINK HERE
			status: 'CONFIRMED',
			organizer: { name: 'mainframeMAU', email: 'mainframeMAU@gmx.com' },
		};

		ics.createEvent(event, (error, value) => {
			if (error) {
				console.log(`Error creating event for ${slot.username}:`, error);
				return;
			}

			const filePath = path.join(
				__dirname,
				'../user_files',
				`${slot.username}.ical`
			);

			fs.writeFile(filePath, value, (err) => {
				if (err) {
					console.error(`Failed to write ICS file for ${slot.username}:`, err);
				} else {
					console.log(`ICS file created for ${slot.username} at ${filePath}`);
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
