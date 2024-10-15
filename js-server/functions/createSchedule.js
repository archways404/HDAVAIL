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

function getDayOfWeek(dateString) {
	const date = new Date(dateString);
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dayOfWeek = date.getDay();
	return daysOfWeek[dayOfWeek];
}

function createSchedule() {
	const scheduleTemplate = {
		weekdays: [
			{ name: 'HDORKBIBA', startDate: '08:00', endDate: '12:30' },
			{ name: 'HDORKBIBA', startDate: '12:30', endDate: '17:00' },
			{ name: 'HDORKBIBA', startDate: '17:00', endDate: '20:00' },
			{ name: 'HDORKBIBB', startDate: '09:00', endDate: '13:00' },
			{ name: 'HDORKBIBB', startDate: '13:00', endDate: '17:00' },
			{ name: 'HDTELEA', startDate: '09:00', endDate: '14:00' },
			{ name: 'HDHSBIB', startDate: '10:00', endDate: '13:00' },
			{ name: 'TEKNIKULTÅNINGEN', startDate: '09:00', endDate: '13:00' },
			{ name: 'DIGIMA', startDate: '08:30', endDate: '12:30' },
		],
		friday: [
			{ name: 'HDORKBIBA', startDate: '08:00', endDate: '12:30' },
			{ name: 'HDORKBIBA', startDate: '12:30', endDate: '17:00' },
			{ name: 'HDORKBIBB', startDate: '09:00', endDate: '13:00' },
			{ name: 'HDORKBIBB', startDate: '13:00', endDate: '17:00' },
			{ name: 'HDTELEA', startDate: '09:00', endDate: '14:00' },
			{ name: 'HDHSBIB', startDate: '10:00', endDate: '13:00' },
			{ name: 'TEKNIKULTÅNINGEN', startDate: '09:00', endDate: '13:00' },
			{ name: 'DIGIMA', startDate: '08:30', endDate: '12:30' },
		],
		saturday: [{ name: 'HDORKBIBA', startDate: '11:00', endDate: '16:00' }],
		sunday: [],
	};
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

	const scheduleByDate = {};

	nonRed.forEach((date) => {
		const dayOfWeek = getDayOfWeek(date);
		let scheduleForDay;
		if (
			dayOfWeek === 'Mon' ||
			dayOfWeek === 'Tue' ||
			dayOfWeek === 'Wed' ||
			dayOfWeek === 'Thu'
		) {
			scheduleForDay = scheduleTemplate.weekdays;
		} else if (dayOfWeek === 'Fri') {
			scheduleForDay = scheduleTemplate.friday;
		} else if (dayOfWeek === 'Sat') {
			scheduleForDay = scheduleTemplate.saturday;
		} else if (dayOfWeek === 'Sun') {
			scheduleForDay = scheduleTemplate.sunday;
		}
		scheduleByDate[date] = scheduleForDay;
	});

	return scheduleByDate;
}

module.exports = { createSchedule };
