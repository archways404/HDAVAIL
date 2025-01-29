import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const daysOfWeek = [
	{ id: 1, name: 'Monday' },
	{ id: 2, name: 'Tuesday' },
	{ id: 3, name: 'Wednesday' },
	{ id: 4, name: 'Thursday' },
	{ id: 5, name: 'Friday' },
	{ id: 6, name: 'Saturday' },
	{ id: 7, name: 'Sunday' },
];

function CreateTemplate() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [shiftTypes, setShiftTypes] = useState([]); // Fetched shift types
	const [currentDay, setCurrentDay] = useState(1); // Start on Monday
	const [entries, setEntries] = useState([]); // Global entries list
	const [showAddEntryForm, setShowAddEntryForm] = useState(false);
	const [newEntry, setNewEntry] = useState({
		shift_id: '',
		title: '',
		start_time: '',
		end_time: '',
	});
	const [editingIndex, setEditingIndex] = useState(null); // To track if an entry is being edited
	const [showSummary, setShowSummary] = useState(false); // Show summary screen

	// Fetch shift types from the backend
	useEffect(() => {
		const fetchShiftTypes = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getShiftTypes`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch shift types');
				}
				const data = await response.json();
				setShiftTypes(data.shift_types);
			} catch (error) {
				console.error('Error fetching shift types:', error.message);
			}
		};

		fetchShiftTypes();
	}, []);

	// Handle navigation
	const handleNextDay = () => {
		if (currentDay < 7) {
			setCurrentDay((prev) => prev + 1);
		} else {
			// On Sunday, show the summary screen
			setShowSummary(true);
		}
	};

	const handlePreviousDay = () => {
		if (currentDay > 1) {
			setCurrentDay((prev) => prev - 1);
		} else {
			// Hide summary and go back to Saturday
			setShowSummary(false);
		}
	};

	// Handle adding or editing an entry
	const handleAddOrEditEntry = () => {
		if (editingIndex !== null) {
			// Edit existing entry
			setEntries((prev) => {
				const updatedEntries = [...prev];
				updatedEntries[editingIndex] = { ...newEntry, weekday: currentDay };
				return updatedEntries;
			});
		} else {
			// Add new entry
			const entry = { ...newEntry, weekday: currentDay };
			setEntries((prev) => [...prev, entry]);
		}

		setNewEntry({ shift_id: '', title: '', start_time: '', end_time: '' });
		setShowAddEntryForm(false);
		setEditingIndex(null);
	};

	// Handle deleting an entry
	const handleDeleteEntry = (index) => {
		setEntries((prev) => prev.filter((_, i) => i !== index));
	};

	// Filter entries for the current day
	const currentDayEntries = entries.filter(
		(entry) => entry.weekday === currentDay
	);

	// Handle sending data
	const handleSendData = async () => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/submitTemplate`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(entries),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send data');
			}

			alert('Template submitted successfully!');
			setEntries([]); // Clear entries after successful submission
			setCurrentDay(1); // Reset to Monday
			setShowSummary(false); // Hide summary
		} catch (error) {
			console.error('Error submitting template:', error.message);
			alert('Failed to submit template. Please try again.');
		}
	};

	if (showSummary) {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
					<h1 className="text-2xl font-bold">Summary</h1>
					<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
						<h2 className="text-xl font-semibold">All Entries</h2>
						<ul className="mt-4 space-y-2">
							{entries.map((entry, index) => (
								<li
									key={index}
									className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
									<p>
										<strong>Day:</strong>{' '}
										{daysOfWeek.find((day) => day.id === entry.weekday).name}
									</p>
									<p>
										<strong>Shift:</strong> {entry.title}
									</p>
									<p>
										<strong>Time:</strong> {entry.start_time} - {entry.end_time}
									</p>
								</li>
							))}
						</ul>
						<div className="mt-6 text-center">
							<button
								className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
								onClick={handlePreviousDay}>
								Back
							</button>
							<button
								className="bg-green-500 text-white px-4 py-2 rounded"
								onClick={handleSendData}>
								Send
							</button>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
				<h1 className="text-2xl font-bold">Create Shift Template</h1>
				<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
					{/* Current Day */}
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
						{`Day: ${daysOfWeek[currentDay - 1].name}`}
					</h1>

					{/* Navigation Buttons */}
					<div className="flex justify-between mt-4">
						<button
							className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
							onClick={handlePreviousDay}
							disabled={currentDay === 1 && !showSummary}>
							{currentDay === 1 ? 'Start' : 'Previous'}
						</button>
						<button
							className={`${
								currentDay === 7 ? 'bg-purple-500' : 'bg-blue-500'
							} text-white px-4 py-2 rounded`}
							onClick={handleNextDay}>
							{currentDay === 7 ? 'Continue' : 'Next'}
						</button>
					</div>

					{/* Add Entry Button */}
					{currentDay <= 7 && (
						<div className="mt-6 text-center">
							<button
								className="bg-green-500 text-white px-4 py-2 rounded"
								onClick={() => setShowAddEntryForm(true)}>
								{editingIndex !== null ? 'Edit Entry' : 'Add Entry'}
							</button>
						</div>
					)}

					{/* Add/Edit Entry Form */}
					{showAddEntryForm && (
						<div className="mt-6 bg-gray-100 dark:bg-gray-700 p-4 rounded">
							<h2 className="text-lg font-semibold">
								{editingIndex !== null ? 'Edit Entry' : 'Add Entry'}
							</h2>
							<div className="mt-4 space-y-4">
								{/* Shift Selector */}
								<div>
									<label className="block text-sm font-medium">Shift</label>
									<select
										className="w-full p-2 border rounded"
										value={newEntry.shift_id}
										onChange={(e) => {
											const selectedShift = shiftTypes.find(
												(shift) => shift.shift_type_id === e.target.value
											);
											setNewEntry({
												...newEntry,
												shift_id: selectedShift.shift_type_id,
												title: selectedShift.name_short,
											});
										}}>
										<option value="">Select a shift</option>
										{shiftTypes.map((shift) => (
											<option
												key={shift.shift_type_id}
												value={shift.shift_type_id}>
												{shift.name_short}
											</option>
										))}
									</select>
								</div>

								{/* Start Time */}
								<div>
									<label className="block text-sm font-medium">
										Start Time
									</label>
									<input
										type="time"
										className="w-full p-2 border rounded"
										value={newEntry.start_time}
										onChange={(e) =>
											setNewEntry({ ...newEntry, start_time: e.target.value })
										}
									/>
								</div>

								{/* End Time */}
								<div>
									<label className="block text-sm font-medium">End Time</label>
									<input
										type="time"
										className="w-full p-2 border rounded"
										value={newEntry.end_time}
										onChange={(e) =>
											setNewEntry({ ...newEntry, end_time: e.target.value })
										}
									/>
								</div>

								{/* Add/Edit Entry Button */}
								<div className="text-center">
									<button
										className="bg-green-500 text-white px-4 py-2 rounded"
										onClick={handleAddOrEditEntry}
										disabled={
											!newEntry.shift_id ||
											!newEntry.start_time ||
											!newEntry.end_time
										}>
										{editingIndex !== null ? 'Save Changes' : 'Add Entry'}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Current Day Entries */}
					<div className="mt-8">
						<h2 className="text-xl font-semibold">Entries for Today</h2>
						<ul className="mt-4 space-y-2">
							{currentDayEntries.map((entry, index) => (
								<li
									key={index}
									className="p-4 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center">
									<div>
										<p>
											<strong>Shift:</strong> {entry.title}
										</p>
										<p>
											<strong>Time:</strong> {entry.start_time} -{' '}
											{entry.end_time}
										</p>
									</div>
									<div className="space-x-2">
										<button
											className="bg-yellow-500 text-white px-2 py-1 rounded"
											onClick={() => {
												setNewEntry(entry);
												setEditingIndex(index);
												setShowAddEntryForm(true);
											}}>
											Edit
										</button>
										<button
											className="bg-red-500 text-white px-2 py-1 rounded"
											onClick={() => handleDeleteEntry(index)}>
											Delete
										</button>
									</div>
								</li>
							))}
							{currentDayEntries.length === 0 && (
								<p className="text-gray-600 dark:text-gray-300">
									No entries for today.
								</p>
							)}
						</ul>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default CreateTemplate;
