const Holidays = require('date-holidays');
const hd = new Holidays('SE');

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

// Generate entries for the specified month
function generateEntries(formattedData, year, month) {
	const daysInMonth = new Date(year, month, 0).getDate(); // Total days in the given month
	const entries = [];

	// Loop through the days of the month
	for (let day = 1; day <= daysInMonth; day++) {
		const dateString = `${year}-${String(month).padStart(2, '0')}-${String(
			day
		).padStart(2, '0')}`; // Format as YYYY-MM-DD
		const date = new Date(dateString); // Create a Date object for weekday calculation
		const weekday = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

		// Match with weekdays in the formattedData
		formattedData.forEach((item) => {
			if (
				item.weekday === (weekday === 0 ? 7 : weekday) &&
				checkDate(dateString)
			) {
				entries.push({
					id: item.id,
					title: item.title,
					description: item.description,
					date: dateString, // Use the string date directly
				});
			}
		});
	}

	return entries;
}

const formattedData = [
	{
		id: 'b5d31ee8-470e-407b-b3e0-53329b6385ab',
		title: 'HDTELEA',
		weekday: 1,
		description: 'Helpdesk Tele A',
	},
	{
		id: 'b5d31ee8-470e-407b-b3e0-53329b6385ab',
		title: 'HDTELEA',
		weekday: 2,
		description: 'Helpdesk Tele A',
	},
	{
		id: 'b5d31ee8-470e-407b-b3e0-53329b6385ab',
		title: 'HDTELEA',
		weekday: 3,
		description: 'Helpdesk Tele A',
	},
	{
		id: 'b5d31ee8-470e-407b-b3e0-53329b6385ab',
		title: 'HDTELEA',
		weekday: 4,
		description: 'Helpdesk Tele A',
	},
	{
		id: 'b5d31ee8-470e-407b-b3e0-53329b6385ab',
		title: 'HDTELEA',
		weekday: 5,
		description: 'Helpdesk Tele A',
	},
	{
		id: 'b5d31ee8-470e-407b-b3e0-53329b6385ab',
		title: 'HDTELEA',
		weekday: 6,
		description: 'Helpdesk Tele A',
	},
];

const year = 2025;
const month = 12;

const entries = generateEntries(formattedData, year, month);
console.log(entries);
