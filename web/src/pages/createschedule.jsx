import { useState, useEffect } from 'react';
import Layout from '../components/Layout'; // Assuming you use Layout component
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover'; // Import ShadCN Popover

const CreateSchedule = () => {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [scheduleData, setScheduleData] = useState({});
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeEntry, setActiveEntry] = useState(null); // State to track active entry for editing

	// Fetch schedule template data for next month
	useEffect(() => {
		const fetchScheduleTemplate = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/scheduleTemplate`
				);
				const data = await response.json();
				setScheduleData(data);
				setLoading(false);

				// Set to next month
				const now = new Date();
				setCurrentMonth(new Date(now.getFullYear(), now.getMonth() + 1, 1));
			} catch (error) {
				console.error('Error fetching schedule template:', error);
				setLoading(false);
			}
		};

		fetchScheduleTemplate();
	}, []);

	// Get the dates for the next month
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

	// Handle submitting the customized schedule
	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/createSchedule`,
				{
					method: 'POST', // Adjust method if needed
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(scheduleData),
				}
			);
			if (!response.ok) {
				throw new Error('Failed to submit schedule');
			}
			alert('Schedule submitted successfully');
		} catch (error) {
			console.error('Error submitting schedule:', error);
			alert('Failed to submit schedule');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Group data by date
	const groupedData = Object.keys(scheduleData).reduce((acc, date) => {
		acc[date] = scheduleData[date];
		return acc;
	}, {});

	// Handle selecting an entry to edit
	const handleEditEntry = (date, index) => {
		setActiveEntry({ date, index, ...scheduleData[date][index] });
	};

	// Handle input changes in the popover
	const handleInputChange = (field, value) => {
		setActiveEntry({ ...activeEntry, [field]: value });
	};

	// Handle saving an entry after editing
	const handleSaveEntry = () => {
		const updatedSchedule = { ...scheduleData };
		updatedSchedule[activeEntry.date][activeEntry.index] = activeEntry;
		setScheduleData(updatedSchedule);
		setActiveEntry(null); // Close the popover after saving
	};

	// Get the dates for the next month
	const datesOfMonth = getMonthDates(currentMonth);

	if (loading) {
		return <p>Loading schedule template...</p>;
	}

	return (
		<Layout>
			<div className="flex justify-center items-center mb-8 mt-4 space-x-6">
				<div className="text-center">
					<div className="text-2xl font-bold text-white">
						{currentMonth.getFullYear()}
					</div>
					<div className="text-lg text-gray-300">
						{currentMonth.toLocaleString('default', { month: 'long' })}
					</div>
				</div>
				<button
					className="p-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700"
					onClick={handleSubmit}
					disabled={isSubmitting}>
					{isSubmitting ? 'Submitting...' : 'Submit Schedule'}
				</button>
			</div>
			<div className="container mx-auto p-4 max-w-screen-xl">
				<div className="grid grid-cols-7 gap-4 bg-gray-800 rounded-lg shadow-lg p-6">
					{datesOfMonth.map((date, index) => (
						<DayColumn
							key={index}
							date={date}
							entries={groupedData[date] || []}
							handleEditEntry={handleEditEntry}
						/>
					))}
				</div>
			</div>

			{/* Popover for editing entries */}
			{activeEntry && (
				<Popover
					open={true}
					onClose={() => setActiveEntry(null)}>
					<PopoverContent>
						<div className="p-4">
							<h3 className="text-lg font-bold mb-4">Edit Schedule Entry</h3>
							<div>
								<label className="block mb-2">Name</label>
								<input
									type="text"
									value={activeEntry.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
									className="border border-gray-300 p-2 rounded w-full"
								/>
							</div>
							<div>
								<label className="block mb-2">Start Time</label>
								<input
									type="time"
									value={activeEntry.startDate}
									onChange={(e) =>
										handleInputChange('startDate', e.target.value)
									}
									className="border border-gray-300 p-2 rounded w-full"
								/>
							</div>
							<div>
								<label className="block mb-2">End Time</label>
								<input
									type="time"
									value={activeEntry.endDate}
									onChange={(e) => handleInputChange('endDate', e.target.value)}
									className="border border-gray-300 p-2 rounded w-full"
								/>
							</div>
							<button
								className="mt-4 p-2 bg-blue-600 text-white rounded"
								onClick={handleSaveEntry}>
								Save
							</button>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</Layout>
	);
};

// Local DayColumn component to display and edit entries
const DayColumn = ({ date, entries, handleEditEntry }) => {
	return (
		<div className="bg-gray-700 text-white p-4 rounded shadow-lg">
			<div className="font-bold mb-2">{date}</div>
			{entries.length > 0 ? (
				entries.map((entry, index) => (
					<Popover key={index}>
						<PopoverTrigger asChild>
							<button className="mb-2 w-full text-left">
								<p>{entry.name}</p>
								<p>
									{entry.startDate} - {entry.endDate}
								</p>
							</button>
						</PopoverTrigger>
						<PopoverContent>
							<div className="p-4">
								<h3 className="text-lg font-bold mb-4">Edit Schedule Entry</h3>
								<div>
									<label className="block mb-2">Name</label>
									<input
										type="text"
										value={entry.name}
										onChange={(e) => handleEditEntry(date, index)}
										className="border border-gray-300 p-2 rounded w-full"
									/>
								</div>
								<div>
									<label className="block mb-2">Start Time</label>
									<input
										type="time"
										value={entry.startDate}
										onChange={(e) => handleEditEntry(date, index)}
										className="border border-gray-300 p-2 rounded w-full"
									/>
								</div>
								<div>
									<label className="block mb-2">End Time</label>
									<input
										type="time"
										value={entry.endDate}
										onChange={(e) => handleEditEntry(date, index)}
										className="border border-gray-300 p-2 rounded w-full"
									/>
								</div>
								<button className="mt-4 p-2 bg-blue-600 text-white rounded">
									Save
								</button>
							</div>
						</PopoverContent>
					</Popover>
				))
			) : (
				<p>No entries</p>
			)}
		</div>
	);
};

export default CreateSchedule;
