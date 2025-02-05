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

async function generateICSFileForUser(userUUID, shifts) {
	// Define the directory to store the ICS files.
	const userFilesPath = path.join(__dirname, '../user_files/');
	if (!fs.existsSync(userFilesPath)) {
		fs.mkdirSync(userFilesPath, { recursive: true });
	}

	// Map each shift to an event for the ICS file.
	const events = shifts.map((shift) => {
		// Create a Date object from the shift date.
		const shiftDate = new Date(shift.date);
		const year = shiftDate.getUTCFullYear();
		const month = shiftDate.getUTCMonth() + 1; // months are 0-indexed in JS
		const day = shiftDate.getUTCDate();

		// Parse the start and end times.
		const [startHour, startMinute] = shift.start_time.split(':').map(Number);
		const [endHour, endMinute] = shift.end_time.split(':').map(Number);

		return {
			start: [year, month, day, startHour, startMinute],
			end: [year, month, day, endHour, endMinute],
			title: `Shift (${shift.shift_type_id})`, // you might want to replace shift_type_id with a human-friendly value
			description: `Shift ID: ${shift.shift_id}`,
			// If you have a location field in your data, set it here; otherwise, leave it empty.
			location: '',
			status: 'CONFIRMED',
			organizer: { name: 'mainframeMAU', email: 'mainframeMAU@gmx.com' },
			// Optionally add URL or other properties here.
		};
	});

	// Wrap the ICS creation in a promise.
	return new Promise((resolve, reject) => {
		ics.createEvents(events, (error, value) => {
			if (error) {
				console.error(`Error creating ICS events for user ${userUUID}:`, error);
				return reject(error);
			}
			const filePath = path.join(userFilesPath, `${userUUID}.ical`);
			fs.writeFile(filePath, value, (err) => {
				if (err) {
					console.error(`Failed to write ICS file for user ${userUUID}:`, err);
					return reject(err);
				} else {
					console.log(`ICS file created for user ${userUUID} at ${filePath}`);
					resolve(filePath);
				}
			});
		});
	});
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

async function getAffectedUsers(fastify, group_id) {
	const query = `
    SELECT user_id
    FROM account_schedule_groups
    WHERE group_id = $1
  `;
	const { rows } = await fastify.pg.query(query, [group_id]);
	console.log('User UUIDs in the group:', rows);
	// Transform the array of objects into an array of user_id strings
	const userUUIDs = rows.map((row) => row.user_id);
	return userUUIDs;
}

async function getActiveShiftsForUser(fastify, uuid) {
	const query = `
    SELECT *
    FROM active_shifts
    WHERE assigned_to = $1
  `;
	const { rows } = await fastify.pg.query(query, [uuid]);
	console.log('Active shifts for user:', rows);
	return rows;
}

module.exports = {
	getAssignedSlots,
	generateICSFiles,
	getAffectedUsers,
	getActiveShiftsForUser,
	generateICSFileForUser,
};
