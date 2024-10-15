import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import Layout from '../components/Layout';

function CreateSchedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [currentMonth, setCurrentMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 1); // Next month
	});
	const [scheduleData, setScheduleData] = useState({});

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
	}, []);

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

	const getMonthDates = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);
		const dates = [];

		const startDay = new Date(firstDayOfMonth);
		const firstDayWeekday = startDay.getDay();
		const dayOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
		startDay.setDate(startDay.getDate() - dayOffset);

		const endDay = new Date(lastDayOfMonth);
		endDay.setDate(endDay.getDate() + ((7 - endDay.getDay()) % 7) + 1);

		for (
			let day = new Date(startDay);
			day <= endDay;
			day.setDate(day.getDate() + 1)
		) {
			dates.push(new Date(day).toISOString().split('T')[0]);
		}
		dates.shift();

		return dates;
	};

	const datesOfMonth = getMonthDates(currentMonth);

	// ** Editing logic: store the editing data in state **
	const [editEntry, setEditEntry] = useState(null);
	const handleEditEntry = (date, entry) => {
		setEditEntry({ date, ...entry });
	};

	const saveChanges = (date, updatedEntry) => {
		// Update the specific entry in scheduleData with the changes made in the popover
		const updatedEntries = scheduleData[date].map((entry) => {
			// Identify the entry being edited by comparing something unique, like startDate and endDate
			if (
				entry.name === updatedEntry.originalName &&
				entry.startDate === updatedEntry.originalStartDate &&
				entry.endDate === updatedEntry.originalEndDate
			) {
				return {
					...entry,
					name: updatedEntry.name,
					startDate: updatedEntry.startDate,
					endDate: updatedEntry.endDate,
				};
			}
			return entry;
		});

		setScheduleData({ ...scheduleData, [date]: updatedEntries });
	};

	const deleteEntry = (date, entryToDelete) => {
		// Remove the entry from scheduleData
		const updatedEntries = scheduleData[date].filter(
			(entry) => entry !== entryToDelete
		);
		setScheduleData({ ...scheduleData, [date]: updatedEntries });
		setEditEntry(null); // Close popover after deletion
	};

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
						<Popover key={index}>
							<PopoverTrigger asChild>
								<Button className="bg-gray-700 p-2 rounded mb-2 w-full flex flex-col items-start text-left">
									{/* Separate name and time on different lines */}
									<div className="text-white font-medium">{entry.name}</div>
									<div className="text-gray-300">
										{entry.startDate} - {entry.endDate}
									</div>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="p-4 bg-gray-800">
								<EditForm
									entry={entry}
									onSave={(updatedEntry) => saveChanges(date, updatedEntry)}
									onDelete={() => deleteEntry(date, entry)}
								/>
							</PopoverContent>
						</Popover>
					))
				) : (
					<div className="text-gray-500">No shifts</div>
				)}
			</div>
		);
	};

	const EditForm = ({ entry, onSave, onDelete }) => {
		// Local state for editing values
		const [localEntry, setLocalEntry] = useState({
			originalName: entry.name, // Store original name to identify entry later
			originalStartDate: entry.startDate, // Store original start time to identify entry later
			originalEndDate: entry.endDate, // Store original end time to identify entry later
			name: entry.name, // New name value to edit
			startDate: entry.startDate, // New start time value to edit
			endDate: entry.endDate, // New end time value to edit
		});

		return (
			<div className="flex flex-col space-y-2">
				<Input
					value={localEntry.name}
					onChange={(e) =>
						setLocalEntry({ ...localEntry, name: e.target.value })
					}
					placeholder="Name"
				/>
				<Input
					value={localEntry.startDate}
					onChange={(e) =>
						setLocalEntry({ ...localEntry, startDate: e.target.value })
					}
					placeholder="Start Time"
				/>
				<Input
					value={localEntry.endDate}
					onChange={(e) =>
						setLocalEntry({ ...localEntry, endDate: e.target.value })
					}
					placeholder="End Time"
				/>
				<Button onClick={() => onSave(localEntry)}>Save</Button>
				<Button
					onClick={onDelete}
					variant="destructive">
					Delete
				</Button>
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
				<Button onClick={() => console.log(scheduleData)}>test</Button>
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
