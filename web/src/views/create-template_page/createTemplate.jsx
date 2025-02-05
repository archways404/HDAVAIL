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

	// Meta data for the user's existing templates
	const [templateMeta, setTemplateMeta] = useState([]);
	// The selected template that will be used as the base for the new template
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [shiftTypes, setShiftTypes] = useState([]); // Fetched shift types
	const [currentDay, setCurrentDay] = useState(1); // Start on Monday
	// Global entries list (loaded from DB and/or new entries)
	const [entries, setEntries] = useState([]);
	const [showAddEntryForm, setShowAddEntryForm] = useState(false);
	// newEntry holds the current form data; we use shift_type_id (not shift_id)
	const [newEntry, setNewEntry] = useState({
		shift_type_id: '',
		title: '',
		start_time: '',
		end_time: '',
	});
	// editingIndex tracks which entry is being edited (if any)
	const [editingIndex, setEditingIndex] = useState(null);
	const [showSummary, setShowSummary] = useState(false); // Show summary screen

	// Fetch shift types and template meta from the backend on mount
	useEffect(() => {
		fetchTemplateMeta();
		fetchShiftTypes();
	}, []);

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

	const fetchTemplateMeta = async () => {
		if (!user?.uuid) return;
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/getTemplateMetaForUser?user_id=${
					user.uuid
				}`
			);
			const data = await response.json();
			setTemplateMeta(data.template_meta);
		} catch (error) {
			console.error('Error fetching template meta:', error);
		}
	};

	// When a template is selected and shiftTypes are loaded, fetch its entries.
	useEffect(() => {
		const fetchTemplateData = async (template_id) => {
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BASE_ADDR
					}/getTemplateData?template_id=${template_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch template data');
				}
				const data = await response.json();
				return data; // Expecting an array of template entries
			} catch (error) {
				console.error('Error fetching template data:', error);
				return [];
			}
		};

		if (selectedTemplate && shiftTypes.length > 0) {
			fetchTemplateData(selectedTemplate.template_id).then((data) => {
				if (data && data.length > 0) {
					// Map over the data to ensure each entry has:
					// - shift_type_id (for the dropdown)
					// - title derived from shiftTypes lookup
					// - template_id from the selected template
					// We intentionally do not store shift_id.
					const updatedData = data.map((entry) => {
						const shift = shiftTypes.find(
							(s) => s.shift_type_id === entry.shift_type_id
						);
						return {
							template_id: selectedTemplate.template_id,
							shift_type_id: entry.shift_type_id,
							title: shift ? shift.name_short : entry.title,
							start_time: entry.start_time,
							end_time: entry.end_time,
							weekday: entry.weekday,
						};
					});
					setEntries(updatedData);
				} else {
					setEntries([]);
				}
			});
		}
	}, [selectedTemplate, shiftTypes]);

	// Navigation handlers
	const handleNextDay = () => {
		if (currentDay < 7) {
			setCurrentDay((prev) => prev + 1);
		} else {
			setShowSummary(true);
		}
	};

	const handlePreviousDay = () => {
		if (currentDay > 1) {
			setCurrentDay((prev) => prev - 1);
		} else {
			setShowSummary(false);
		}
	};

	// When adding or editing an entry:
	const handleAddOrEditEntry = () => {
		// Build the entry without any shift_id.
		const entryToSave = {
			template_id: selectedTemplate.template_id,
			shift_type_id: newEntry.shift_type_id,
			title: newEntry.title,
			start_time: newEntry.start_time,
			end_time: newEntry.end_time,
			weekday: currentDay,
		};

		if (editingIndex !== null) {
			// Replace the existing entry at editingIndex
			setEntries((prev) => {
				const updatedEntries = [...prev];
				updatedEntries[editingIndex] = entryToSave;
				return updatedEntries;
			});
		} else {
			// Add a new entry
			setEntries((prev) => [...prev, entryToSave]);
		}

		// Clear the form and reset editing state
		setNewEntry({ shift_type_id: '', title: '', start_time: '', end_time: '' });
		setShowAddEntryForm(false);
		setEditingIndex(null);
	};

	// Delete an entry
	const handleDeleteEntry = (index) => {
		setEntries((prev) => prev.filter((_, i) => i !== index));
	};

	// Filter entries for the current day
	const currentDayEntries = entries.filter(
		(entry) => entry.weekday === currentDay
	);

	// Submit the data to the backend
	const handleSendData = async () => {
		try {
			// Build the payload without any shift_id in each entry
			const payloadEntries = entries.map(
				({
					shift_type_id,
					title,
					start_time,
					end_time,
					weekday,
					template_id,
				}) => ({
					shift_type_id,
					title,
					start_time,
					end_time,
					weekday,
					template_id,
				})
			);

			const payload = {
				template_id: selectedTemplate.template_id,
				entries: payloadEntries,
			};

			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/submitTemplate`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send data');
			}

			alert('Template submitted successfully!');
			setEntries([]); // Clear entries after submission
			setCurrentDay(1); // Reset day
			setShowSummary(false);
			setSelectedTemplate(null);
		} catch (error) {
			console.error('Error submitting template:', error.message);
			alert('Failed to submit template. Please try again.');
		}
	};

	// --- Render different views ---

	// Template selection view
	if (!selectedTemplate && templateMeta.length > 0) {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
					<h1 className="text-2xl font-bold">Select a Template</h1>
					<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
						<p className="mb-4">
							Please select one of your existing templates before creating a new
							one.
						</p>
						<ul className="space-y-2">
							{templateMeta.map((template) => (
								<li
									key={template.template_id}
									className="p-4 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
									onClick={() => setSelectedTemplate(template)}>
									<p>
										<strong>{template.name}</strong>
									</p>
									<p>{template.description}</p>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Layout>
		);
	}

	// No template meta exists message
	if (templateMeta.length === 0) {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
					<h1 className="text-2xl font-bold">No Template Found</h1>
					<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
						<p>You do not have any template meta data available.</p>
						<p>Please create a template meta before creating a new template.</p>
					</div>
				</div>
			</Layout>
		);
	}

	// Summary view: display all entries to be submitted.
	if (showSummary) {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
					<h1 className="text-2xl font-bold">Review Your Template Entries</h1>
					<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
						<ul className="space-y-2">
							{entries.map((entry, index) => (
								<li
									key={index}
									className="p-4 bg-gray-200 rounded">
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
							{entries.length === 0 && (
								<p className="text-gray-600 dark:text-gray-300">
									No entries to submit.
								</p>
							)}
						</ul>
						<div className="mt-6 text-center">
							<button
								className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
								onClick={() => setShowSummary(false)}>
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

	// Main create-template form
	return (
		<Layout>
			<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
				<h1 className="text-2xl font-bold">Create Shift Template</h1>
				<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
					{/* Display the selected template info */}
					<div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded">
						<p>
							<strong>Using Template:</strong> {selectedTemplate.name}
						</p>
						<p>{selectedTemplate.description}</p>
						<button
							className="mt-2 text-sm text-blue-600 hover:underline"
							onClick={() => setSelectedTemplate(null)}>
							Change Template
						</button>
					</div>

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
										value={newEntry.shift_type_id}
										onChange={(e) => {
											const selectedShift = shiftTypes.find(
												(shift) => shift.shift_type_id === e.target.value
											);
											setNewEntry({
												...newEntry,
												shift_type_id: selectedShift.shift_type_id,
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
											!newEntry.shift_type_id ||
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
												// Set the editing form using the existing entry.
												setNewEntry({
													shift_type_id: entry.shift_type_id,
													title: entry.title,
													start_time: entry.start_time,
													end_time: entry.end_time,
												});
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
