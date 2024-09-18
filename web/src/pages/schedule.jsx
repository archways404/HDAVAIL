// import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useState, useEffect } from 'react';
import DayColumn from '../components/DayColumn';

import Layout from '../components/Layout';
import CreateScheduleEntry from '../components/CreateScheduleEntry';

function Schedule() {
	// Get the current date
	const [currentMonth, setCurrentMonth] = useState(new Date());

	// Sample test data
	const [scheduleData, setScheduleData] = useState([
		{
			uid: '20240603_000001',
			moment: 'USER A',
			location: 'HDORKBIBA',
			date: '2024-09-02',
			start_time: '09:00',
			end_time: '10:30',
			hours: 1.5,
		},
		{
			uid: '20240603_000002',
			moment: 'USER B',
			location: 'HDORKBIBB',
			date: '2024-09-03',
			start_time: '11:00',
			end_time: '13:00',
			hours: 2.0,
		},
		{
			uid: '20240603_000003',
			moment: 'USER A',
			location: 'Teknikutlåning',
			date: '2024-09-04',
			start_time: '14:00',
			end_time: '17:00',
			hours: 3.0,
		},
		{
			uid: '20240603_004303',
			moment: 'USER C',
			location: 'HDTELEA',
			date: '2024-09-04',
			start_time: '16:00',
			end_time: '19:00',
			hours: 3.0,
		},
	]);

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

		// Remove the first element
		dates.shift();

		// Add an additional date to the end
		let tempfix = new Date(dates[dates.length - 1]); // Convert last date to a Date object
		tempfix.setDate(tempfix.getDate() + 1); // Add one day
		dates.push(tempfix.toISOString().split('T')[0]); // Convert to string and add to array

		console.log('dates', dates);
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

/*
function Schedule() {
	const [scheduleData, setScheduleData] = useState([]);

	useEffect(() => {
		// Fetch data from the API
		fetch('/api/schedule')
			.then((response) => response.json())
			.then((data) => {
				setScheduleData(data); 
			});
	}, []);

	// Group data by date
	const groupedData = scheduleData.reduce((acc, entry) => {
		const date = entry.date;
		if (!acc[date]) acc[date] = [];
		acc[date].push(entry);
		return acc;
	}, {});

	// Generate dates of the week
	const datesOfWeek = [
		'2024-09-02',
		'2024-09-03',
		'2024-09-04',
		'2024-09-05',
		'2024-09-06',
		'2024-09-07',
		'2024-09-08',
	];

	return (
		<Layout>
			<div className="grid grid-cols-7 gap-4 p-4">
				{datesOfWeek.map((date, index) => (
					<DayColumn
						key={index}
						date={date}
						entries={groupedData[date] || []}
					/>
				))}
			</div>
		</Layout>
	);
}
*/
