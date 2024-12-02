import { useState, useEffect, useContext } from 'react';
import DayColumn from '../components/DayColumn';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

function Schedule() {
	const { user } = useContext(AuthContext);

	console.log('username', user.username);

	if (!user) {
		return null;
	}

	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [scheduleData, setScheduleData] = useState([]);
	const [showUserSchedule, setShowUserSchedule] = useState(false);
	const [allScheduleData, setAllScheduleData] = useState([]);

	const fetchScheduleData = async () => {
		try {
			const url = import.meta.env.VITE_BASE_ADDR + '/viewSchedule';
			console.log('Fetching all schedules');

			const response = await fetch(url);
			const data = await response.json();

			const transformedData = data.map((entry) => ({
				uid: entry.uuid,
				username: entry.username, // Ensure username is part of the transformed data
				moment: `${entry.first_name} ${entry.last_name}`,
				location: entry.shift_type,
				date: entry.shift_date.split('T')[0],
				start_time: entry.start_time,
				end_time: entry.end_time,
				hours: calculateHours(entry.start_time, entry.end_time),
			}));

			// Save all data for toggling
			setAllScheduleData(transformedData);
			setScheduleData(transformedData); // Initially display all schedules
		} catch (error) {
			console.error('Error fetching schedule data:', error);
		}
	};

	useEffect(() => {
		fetchScheduleData();
	}, []);

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
				{/* Button to toggle between all schedules and user's schedule */}
				<button
					onClick={() => {
						setShowUserSchedule(!showUserSchedule);
						if (!showUserSchedule) {
							// Filter schedules for the current user
							setScheduleData(
								allScheduleData.filter(
									(entry) => entry.username === user.username
								)
							);
						} else {
							// Show all schedules
							setScheduleData(allScheduleData);
						}
					}}
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
