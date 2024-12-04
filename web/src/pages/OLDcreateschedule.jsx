import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import Layout from '../components/Layout';
import { PlusIcon } from '@heroicons/react/24/solid';

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

	const deleteEntry = (date, entryToDelete) => {
		// Remove the entry from scheduleData
		const updatedEntries = scheduleData[date].filter(
			(entry) => entry !== entryToDelete
		);
		setScheduleData({ ...scheduleData, [date]: updatedEntries });
		setEditEntry(null); // Close popover after deletion
	};

	// ** New Entry Form Component **
	const NewEntryForm = ({ date, onCreate }) => {
		const [newEntry, setNewEntry] = useState({
			name: '',
			startDate: '', // Time in 'HH:MM'
			endDate: '', // Time in 'HH:MM'
		});
		const [error, setError] = useState(''); // State for error message

		const handleCreate = () => {
			// Clear previous errors
			setError('');

			// Check if startDate is earlier than endDate
			if (newEntry.startDate >= newEntry.endDate) {
				setError('Start time must be earlier than end time');
				return; // Stop submission if validation fails
			}

			// Create the formatted entry if validation passes
			const formattedEntry = {
				...newEntry,
				startDate: newEntry.startDate, // Pass only the time
				endDate: newEntry.endDate,
			};
			onCreate(date, formattedEntry); // Call parent handler to save entry

			// Reset form after submission
			setNewEntry({ name: '', startDate: '', endDate: '' });
		};

		return (
			<div className="flex flex-col space-y-2">
				<Input
					value={newEntry.name}
					onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
					placeholder="Name"
				/>
				{/* Start Time Input */}
				<div className="flex flex-col space-y-1">
					<label className="text-white">Start Time</label>
					<Input
						type="time"
						value={newEntry.startDate}
						onChange={(e) =>
							setNewEntry({ ...newEntry, startDate: e.target.value })
						}
					/>
				</div>
				{/* End Time Input */}
				<div className="flex flex-col space-y-1">
					<label className="text-white">End Time</label>
					<Input
						type="time"
						value={newEntry.endDate}
						onChange={(e) =>
							setNewEntry({ ...newEntry, endDate: e.target.value })
						}
					/>
				</div>

				{/* Display error if validation fails */}
				{error && <div className="text-red-500">{error}</div>}

				<Button onClick={handleCreate}>Create</Button>
			</div>
		);
	};

	// Handle creating the new entry
	const handleCreateEntry = (date, newEntry) => {
		// Add the new entry to the list of entries for the date
		const updatedEntries = [...(scheduleData[date] || []), newEntry];
		setScheduleData({ ...scheduleData, [date]: updatedEntries });
	};

	// ** Edit Form Component **
	const EditForm = ({ entry, onSave, onDelete }) => {
		// Convert the times to 'HH:MM' format for the time picker
		const formatTime = (timeString) => {
			const [hours, minutes] = timeString.split(':');
			return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
		};

		const [localEntry, setLocalEntry] = useState({
			originalName: entry.name, // Store original name to identify the entry
			originalStartDate: entry.startDate, // Store original start time
			originalEndDate: entry.endDate, // Store original end time
			name: entry.name, // New name to edit
			startDate: formatTime(entry.startDate), // Convert start time to HH:MM
			endDate: formatTime(entry.endDate), // Convert end time to HH:MM
		});
		const [error, setError] = useState(''); // State for error message

		const handleSave = () => {
			// Clear previous errors
			setError('');

			// Validate startDate is earlier than endDate
			if (localEntry.startDate >= localEntry.endDate) {
				setError('Start time must be earlier than end time');
				return; // Stop save if validation fails
			}

			// Call onSave if validation passes
			onSave(localEntry);
		};

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
					type="time"
					value={localEntry.startDate}
					onChange={(e) =>
						setLocalEntry({ ...localEntry, startDate: e.target.value })
					}
					placeholder="Start Time"
				/>
				<Input
					type="time"
					value={localEntry.endDate}
					onChange={(e) =>
						setLocalEntry({ ...localEntry, endDate: e.target.value })
					}
					placeholder="End Time"
				/>

				{/* Display error if validation fails */}
				{error && <div className="text-red-500">{error}</div>}

				<Button onClick={handleSave}>Save</Button>
				<Button
					onClick={onDelete}
					variant="destructive">
					Delete
				</Button>
			</div>
		);
	};

	// ** Save Changes in the Schedule Data **
	const saveChanges = (date, updatedEntry) => {
		const updatedEntries = scheduleData[date].map((entry) => {
			if (
				entry.name === updatedEntry.originalName &&
				entry.startDate === updatedEntry.originalStartDate &&
				entry.endDate === updatedEntry.originalEndDate
			) {
				// Return the updated entry with new times
				return {
					...entry,
					name: updatedEntry.name,
					startDate: updatedEntry.startDate,
					endDate: updatedEntry.endDate,
				};
			}
			return entry; // Return unchanged entry if it's not being edited
		});

		// Update the state with new entries
		setScheduleData({ ...scheduleData, [date]: updatedEntries });
	};

	// ** Day Column Component **
	const DayColumn = ({ date, entries, onCreateEntry }) => {
		return (
			<div className="bg-gray-900 p-4 rounded-lg">
				<div className="flex justify-between items-center">
					<div className="text-white text-lg font-bold mb-2">
						{new Date(date).toLocaleDateString('default', { weekday: 'long' })}
					</div>
					{/* Plus button to create a new entry */}
					<Popover>
						<PopoverTrigger asChild>
							<Button className="bg-green-600 text-white p-1 rounded-full shadow-md">
								<PlusIcon className="h-5 w-5" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="p-4 bg-gray-800">
							<NewEntryForm
								date={date}
								onCreate={onCreateEntry}
							/>
						</PopoverContent>
					</Popover>
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
							onCreateEntry={handleCreateEntry}
						/>
					))}
				</div>
			</div>
		</Layout>
	);
}

export default CreateSchedule;
