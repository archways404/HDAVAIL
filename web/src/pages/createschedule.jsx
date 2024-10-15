import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

function CreateSchedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	// Start at the next month
	const [currentMonth, setCurrentMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 1); // Next month
	});
	const [scheduleData, setScheduleData] = useState({});
	const [showUserSchedule, setShowUserSchedule] = useState(false);

	const fetchScheduleData = async () => {
		try {
			let url = import.meta.env.VITE_BASE_ADDR + '/scheduleTemplate';
			const response = await fetch(url);
			const data = await response.json();

			setScheduleData(data);
		} catch (error) {
			console.error('Error fetching schedule data:', error);
		}
	};

	useEffect(() => {
		fetchScheduleData();
	}, [showUserSchedule, user.uuid]);

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

	// Calculate month dates starting on Monday
	const getMonthDates = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();

		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);

		const dates = [];

		// Get the first Monday before or on the 1st day of the month
		const startDay = new Date(firstDayOfMonth);
		const firstDayWeekday = startDay.getDay();
		const dayOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1; // Adjust for Monday start
		startDay.setDate(startDay.getDate() - dayOffset);

		// Get the last Sunday after the end of the month
		const endDay = new Date(lastDayOfMonth);
		endDay.setDate(endDay.getDate() + ((7 - endDay.getDay()) % 7) + 1);

		// Generate all dates between startDay and endDay
		for (
			let day = new Date(startDay);
			day <= endDay;
			day.setDate(day.getDate() + 1)
		) {
			dates.push(new Date(day).toISOString().split('T')[0]);
		}

		// Now shift the dates array to remove the first date if necessary
		dates.shift();

		return dates;
	};

	const datesOfMonth = getMonthDates(currentMonth);

	// Define the DayColumn component inside CreateSchedule
	const DayColumn = ({ date, entries }) => {
		return (
			<div className="bg-gray-900 p-4 rounded-lg">
				<div className="text-white text-lg font-bold mb-2">
					{new Date(date).toLocaleDateString('default', { weekday: 'long' })}
				</div>
				<div className="text-gray-400 mb-2">
					{new Date(date).toLocaleDateString('default', {
						month: 'short',
						day: 'numeric',
					})}
				</div>
				{entries.length > 0 ? (
					entries.map((entry, index) => (
						<div
							key={index}
							className="bg-gray-700 p-2 rounded mb-2">
							<div className="text-white font-medium">{entry.name}</div>
							<div className="text-gray-300">
								{entry.startDate}-{entry.endDate}
							</div>
						</div>
					))
				) : (
					<div className="text-gray-500">No shifts</div>
				)}
			</div>
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
			</div>
			<div className="container mx-auto p-4 max-w-screen-xl">
				<div className="grid grid-cols-7 gap-4 bg-gray-800 rounded-lg shadow-lg p-6">
					{datesOfMonth.map((date, index) => (
						<DayColumn
							key={index}
							date={date}
							entries={scheduleData[date] || []}
						/>
					))}
				</div>
			</div>
		</Layout>
	);
}

export default CreateSchedule;
