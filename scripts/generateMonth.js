const Holidays = require('date-holidays');
const hd = new Holidays('SE');

function checkDate(date) {
	const holiday = hd.isHoliday(date);
	if (!holiday) {
		return true;
	}

	if (Array.isArray(holiday)) {
		const hasSpecialHoliday = holiday.some(
			(h) => h.type === 'public' || h.type === 'bank' || h.type === 'school'
		);
		return !hasSpecialHoliday;
	}

	return (
		holiday.type !== 'public' &&
		holiday.type !== 'bank' &&
		holiday.type !== 'school'
	);
}

function getNextMonthAndYear() {
	const today = new Date();
	let nextMonth = today.getMonth() + 1;
	let nextYear = today.getFullYear();

	if (nextMonth > 11) {
		nextMonth = 0;
		nextYear += 1;
	}

	return { year: nextYear, month: nextMonth + 1 };
}

function getTotalDaysInMonth(year, month) {
	return new Date(year, month, 0).getDate();
}

function generateMonthDays(year, month, totalDays) {
	const days = [];

	for (let day = 1; day <= totalDays; day++) {
		const monthStr = month.toString().padStart(2, '0');
		const dayStr = day.toString().padStart(2, '0');
		const dateStr = `${year}-${monthStr}-${dayStr}`;
		days.push(dateStr);
	}

	return days;
}

function main() {
	const { year, month } = getNextMonthAndYear();
	const totalDays = getTotalDaysInMonth(year, month);
	const nextMonthDays = generateMonthDays(year, month, totalDays);

	let nonRed = [];
	let redDays = [];

	for (let i = 0; i < nextMonthDays.length; i++) {
		const date = new Date(nextMonthDays[i]);
		const isHoliday = !checkDate(date);
		if (isHoliday) {
			redDays.push(nextMonthDays[i]);
		} else {
			nonRed.push(nextMonthDays[i]);
		}
	}

	console.log('Holiday dates (Röda dagar):', redDays);
	console.log('Non-holiday dates (Work days):', nonRed);
}

main();
