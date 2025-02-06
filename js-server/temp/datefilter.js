const Holidays = require('date-holidays');
const hd = new Holidays('SE');
const { v4: uuidv4 } = require('uuid');

// Check if a given date string (YYYY-MM-DD) is not a holiday and log removed dates
function checkDate(dateString) {
	const holiday = hd.isHoliday(dateString); // Use the string directly with Holidays

	if (!holiday) {
		return true; // Not a holiday
	}

	if (Array.isArray(holiday)) {
		// Check if any holiday is public, bank, or school
		const hasSpecialHoliday = holiday.some(
			(h) => h.type === 'public' || h.type === 'bank' || h.type === 'school'
		);
		if (hasSpecialHoliday) {
			console.log(
				`Removed date (holiday): ${dateString} - ${holiday
					.map((h) => h.name)
					.join(', ')}`
			);
		}
		return !hasSpecialHoliday;
	}

	// Single holiday check
	const isSpecialHoliday =
		holiday.type === 'public' ||
		holiday.type === 'bank' ||
		holiday.type === 'school';

	if (isSpecialHoliday) {
		console.log(`Removed date (holiday): ${dateString} - ${holiday.name}`);
	}

	return !isSpecialHoliday;
}

// Generate FullCalendar event objects for the specified month using the formattedData structure.
function generateEntries(formattedData, year, month) {
	// Fully flatten formattedData regardless of its nesting depth.
	const flattenedData = formattedData.flat(Infinity);

	const daysInMonth = new Date(year, month, 0).getDate(); // Total days in the given month
	const events = [];

	// Loop through each day in the month.
	for (let day = 1; day <= daysInMonth; day++) {
		// Build a date string in the format YYYY-MM-DD
		const dateString = `${year}-${String(month).padStart(2, '0')}-${String(
			day
		).padStart(2, '0')}`;

		const date = new Date(dateString);
		const weekdayJS = date.getDay(); // 0 (Sunday) to 6 (Saturday)
		// Convert JavaScript weekday (0 for Sunday) to our expected format (1 for Monday ... 7 for Sunday)
		const weekday = weekdayJS === 0 ? 7 : weekdayJS;

		// Only create events if the date is not a holiday.
		if (checkDate(dateString)) {
			flattenedData.forEach((item) => {
				// If the weekday in the data matches the current day of the week...
				if (item.weekday === weekday) {
					// Build start and end ISO8601 strings by combining dateString with the time parts.
					const startDateTime = `${dateString}T${item.start_time}`;
					const endDateTime = `${dateString}T${item.end_time}`;

					// Create a unique UUID for this event.
					const uniqueEventId = uuidv4();

					events.push({
						id: uniqueEventId, // New unique identifier for the event
						title: item.name_short, // Short name as the title
						start: startDateTime,
						end: endDateTime,
						extendedProps: {
							description: `${item.name_long} from ${item.start_time} to ${item.end_time}`,
							template_id: item.template_id,
							shift_type_id: item.shift_type_id,
							group_id: item.group_id,
							group_name: item.group_name,
							weekday: item.weekday,
							start_time: item.start_time,
							end_time: item.end_time,
						},
					});
				}
			});
		}
	}

	return events;
}

const formattedData = [
	[
		[
			{
				template_id: '30272fdd-e972-4d0f-8480-26490030b0ad',
				shift_type_id: '09f19b49-bba7-498a-9054-3a28df89e8c6',
				weekday: 1,
				start_time: '09:00:00',
				end_time: '14:00:00',
				shift_id: 'ab883de7-a9ae-4515-8371-1a65f2ee126f',
				name_long: 'Helpdesk Tele A',
				name_short: 'HDTELEA',
				group_id: '2c4fe3e6-2859-470b-b1ef-c50bdb7ee0ef',
				group_name: 'Helpdesk',
			},
			{
				template_id: '30272fdd-e972-4d0f-8480-26490030b0ad',
				shift_type_id: '44c7ac06-7bf8-476e-8914-d9b402a7f733',
				weekday: 3,
				start_time: '13:00:00',
				end_time: '17:00:00',
				shift_id: 'e769d4ac-0060-416e-bf2e-88d0f0021666',
				name_long: 'Helpdesk Tele B',
				name_short: 'HDTELEB',
				group_id: '2c4fe3e6-2859-470b-b1ef-c50bdb7ee0ef',
				group_name: 'Helpdesk',
			},
			{
				template_id: '30272fdd-e972-4d0f-8480-26490030b0ad',
				shift_type_id: '44c7ac06-7bf8-476e-8914-d9b402a7f733',
				weekday: 1,
				start_time: '13:00:00',
				end_time: '17:00:00',
				shift_id: 'e2a033f2-9166-40e2-9547-f90667c10bae',
				name_long: 'Helpdesk Tele B',
				name_short: 'HDTELEB',
				group_id: '2c4fe3e6-2859-470b-b1ef-c50bdb7ee0ef',
				group_name: 'Helpdesk',
			},
			{
				template_id: '30272fdd-e972-4d0f-8480-26490030b0ad',
				shift_type_id: '09f19b49-bba7-498a-9054-3a28df89e8c6',
				weekday: 5,
				start_time: '08:00:00',
				end_time: '11:00:00',
				shift_id: '8e16f6b6-6481-4a8e-bfdd-bd50ba1f909a',
				name_long: 'Helpdesk Tele A',
				name_short: 'HDTELEA',
				group_id: '2c4fe3e6-2859-470b-b1ef-c50bdb7ee0ef',
				group_name: 'Helpdesk',
			},
		],
	],
];

const year = 2025;
const month = 12;

const events = generateEntries(formattedData, year, month);
console.log(events);
