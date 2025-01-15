import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

import CalendarViewMonth from '../temp/CalendarViewMonth';
import CalendarViewWeek from '../temp/CalendarViewWeek';
import CalendarViewDay from '../temp/CalendarViewDay';

function Schedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const calendars = [{ id: 'cal1', name: 'Personal' }];
	const initialEvents = [
		{
			id: '1',
			calendarId: 'cal1',
			title: 'Lunch',
			category: 'time',
			start: '2025-01-15T12:00:00',
			end: '2025-01-15T13:30:00',
		},
		{
			id: '2',
			calendarId: 'cal1',
			title: 'Coffee Break',
			category: 'time',
			start: '2025-01-16T15:00:00',
			end: '2025-01-16T15:30:00',
		},
		{
			id: '3',
			calendarId: 'cal1',
			title: 'Lunch2',
			category: 'time',
			start: '2025-01-15T12:00:00',
			end: '2025-01-15T13:30:00',
		},
		{
			id: '4',
			calendarId: 'cal1',
			title: 'Lunch222',
			category: 'time',
			start: '2025-01-16T12:00:00',
			end: '2025-01-16T13:30:00',
		},
		{
			id: '5',
			calendarId: 'cal1',
			title: 'Lunch3',
			category: 'time',
			start: '2025-01-15T12:00:00',
			end: '2025-01-15T13:30:00',
		},
	];

	const [view, setView] = useState('month'); // View state
	const [currentDate, setCurrentDate] = useState(new Date()); // Current date state

	const changeMonth = (offset) => {
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + offset);
		setCurrentDate(newDate);
	};

	const onAfterRenderEvent = (event) => {
		console.log(event.title);
	};

	let CurrentViewComponent;
	if (view === 'month') CurrentViewComponent = CalendarViewMonth;
	else if (view === 'week') CurrentViewComponent = CalendarViewWeek;
	else if (view === 'day') CurrentViewComponent = CalendarViewDay;

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
				<div className="flex space-x-4">
					<button
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						onClick={() => changeMonth(-1)}>
						Previous Month
					</button>
					<span className="text-lg font-semibold">
						{currentDate.toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
						})}
					</span>
					<button
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						onClick={() => changeMonth(1)}>
						Next Month
					</button>
				</div>

				<div className="flex space-x-4 mt-4">
					<button
						className={`px-4 py-2 rounded ${
							view === 'month'
								? 'bg-blue-700 text-white'
								: 'bg-gray-200 hover:bg-gray-300'
						}`}
						onClick={() => setView('month')}>
						Month View
					</button>
					<button
						className={`px-4 py-2 rounded ${
							view === 'week'
								? 'bg-blue-700 text-white'
								: 'bg-gray-200 hover:bg-gray-300'
						}`}
						onClick={() => setView('week')}>
						Week View
					</button>
					<button
						className={`px-4 py-2 rounded ${
							view === 'day'
								? 'bg-blue-700 text-white'
								: 'bg-gray-200 hover:bg-gray-300'
						}`}
						onClick={() => setView('day')}>
						Day View
					</button>
				</div>

				<div className="w-full mt-4">
					<CurrentViewComponent
						currentDate={currentDate}
						calendars={calendars}
						initialEvents={initialEvents}
					/>
				</div>
			</div>
		</Layout>
	);
}

export default Schedule;

/*
import { useState, useEffect, useContext } from 'react';
import DayColumn from '../components/DayColumn';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

function Schedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [scheduleData, setScheduleData] = useState([]);
	const [showUserSchedule, setShowUserSchedule] = useState(false);

	const fetchScheduleData = async (uuid = null) => {
		try {
			let url = import.meta.env.VITE_BASE_ADDR + '/viewSchedule';
			if (uuid) {
				url += `?uuid=${uuid}`;
				console.log(`Fetching user's schedule with uuid: ${uuid}`);
			} else {
				console.log('Fetching all schedules');
			}
			const response = await fetch(url);
			const data = await response.json();

			const transformedData = data.map((entry) => ({
				uid: entry.uuid,
				moment: `${entry.first_name} ${entry.last_name}`,
				location: entry.shift_type,
				date: entry.shift_date.split('T')[0],
				start_time: entry.start_time,
				end_time: entry.end_time,
				hours: calculateHours(entry.start_time, entry.end_time),
			}));

			setScheduleData(transformedData);
		} catch (error) {
			console.error('Error fetching schedule data:', error);
		}
	};

	useEffect(() => {
		if (showUserSchedule) {
			fetchScheduleData(user.uuid);
		} else {
			fetchScheduleData();
		}
	}, [showUserSchedule, user.uuid]);

	const calculateHours = (startTime, endTime) => {
		const start = new Date(`1970-01-01T${startTime}Z`);
		const end = new Date(`1970-01-01T${endTime}Z`);
		const diffInMs = end - start;
		const hours = diffInMs / (1000 * 60 * 60);
		return hours;
	};

	// Get the dates for the current month
	const getMonthDates = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();

		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);

		const dates = [];

		// Get the first Monday on or before the first day of the month
		const startDay = new Date(firstDayOfMonth);
		startDay.setDate(startDay.getDate() - ((startDay.getDay() + 6) % 7));

		// Get the last Sunday on or after the last day of the month
		const endDay = new Date(lastDayOfMonth);
		endDay.setDate(endDay.getDate() + ((7 - endDay.getDay()) % 7));

		// Generate all dates between startDay and endDay
		for (
			let day = new Date(startDay);
			day <= endDay;
			day.setDate(day.getDate() + 1)
		) {
			dates.push(new Date(day).toISOString().split('T')[0]);
		}

		return dates;
	};

	// Group data by date
	const groupedData = scheduleData.reduce((acc, entry) => {
		const date = entry.date;
		if (!acc[date]) acc[date] = [];
		acc[date].push(entry);
		return acc;
	}, {});

	// Get the dates for the current month
	const datesOfMonth = getMonthDates(currentMonth);

	// Handle month navigation
	const handlePreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		);
	};

	const handleNextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		);
	};

	return (
		<Layout>
			<div className="flex justify-center items-center mb-8 mt-4 space-x-6">
				<button
					onClick={handlePreviousMonth}
					className="p-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700">
					Previous
				</button>
				<div className="text-center">
					<div className="text-2xl font-bold text-white">
						{currentMonth.getFullYear()}
					</div>
					<div className="text-lg text-gray-300">
						{currentMonth.toLocaleString('default', { month: 'long' })}
					</div>
				</div>
				<button
					onClick={handleNextMonth}
					className="p-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700">
					Next
				</button>
				
				<button
					onClick={() => setShowUserSchedule(!showUserSchedule)}
					className="p-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700">
					{showUserSchedule ? 'Show All Schedules' : 'Show My Schedule'}
				</button>
			</div>
			<div className="container mx-auto p-4 max-w-screen-xl">
				<div className="grid grid-cols-7 gap-4 bg-gray-800 rounded-lg shadow-lg p-6">
					{datesOfMonth.map((date, index) => (
						<DayColumn
							key={index}
							date={date}
							entries={groupedData[date] || []}
						/>
					))}
				</div>
			</div>
		</Layout>
	);
}

export default Schedule;
*/
