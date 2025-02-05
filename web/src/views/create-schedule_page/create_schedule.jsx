import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek = [
	{ id: 1, name: 'Monday' },
	{ id: 2, name: 'Tuesday' },
	{ id: 3, name: 'Wednesday' },
	{ id: 4, name: 'Thursday' },
	{ id: 5, name: 'Friday' },
	{ id: 6, name: 'Saturday' },
	{ id: 7, name: 'Sunday' },
];

const CreateSchedule = () => {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// viewMode can be null (initial buttons), 'template', or 'manual'
	const [viewMode, setViewMode] = useState(null);

	// --- Template Flow State ---
	const [templateMeta, setTemplateMeta] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [shiftTypes, setShiftTypes] = useState([]);
	const [currentDay, setCurrentDay] = useState(1);
	const [entries, setEntries] = useState([]);
	const [showAddEntryForm, setShowAddEntryForm] = useState(false);
	const [newEntry, setNewEntry] = useState({
		shift_type_id: '',
		title: '',
		start_time: '',
		end_time: '',
	});
	const [editingIndex, setEditingIndex] = useState(null);
	const [showSummary, setShowSummary] = useState(false);

	// --- Effect: Fetch template meta and shift types when entering template flow ---
	useEffect(() => {
		if (viewMode === 'template' && user) {
			fetchTemplateMeta();
			fetchShiftTypes();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewMode, user]);

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

	// --- Template Flow Handlers ---
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

	const handleAddOrEditEntry = () => {
		const entryToSave = {
			template_id: selectedTemplate.template_id,
			shift_type_id: newEntry.shift_type_id,
			title: newEntry.title,
			start_time: newEntry.start_time,
			end_time: newEntry.end_time,
			weekday: currentDay,
		};

		if (editingIndex !== null) {
			setEntries((prev) => {
				const updatedEntries = [...prev];
				updatedEntries[editingIndex] = entryToSave;
				return updatedEntries;
			});
		} else {
			setEntries((prev) => [...prev, entryToSave]);
		}

		setNewEntry({ shift_type_id: '', title: '', start_time: '', end_time: '' });
		setShowAddEntryForm(false);
		setEditingIndex(null);
	};

	const handleDeleteEntry = (index) => {
		setEntries((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSendData = async () => {
		try {
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

	// --- Initial Handlers for view selection ---
	const handleTemplateClick = () => {
		toast({
			title: 'Template',
			description: 'You selected Template entry.',
			duration: 1500,
		});
		setViewMode('template');
	};

	const handleManualClick = () => {
		toast({
			title: 'Manual',
			description: 'You selected Manual entry.',
			duration: 1500,
		});
		setViewMode('manual');
	};

	// If no user, return nothing.
	if (!user) {
		return null;
	}

	// --- Render the Manual Entry View ---
	if (viewMode === 'manual') {
		return (
			<Layout>
				<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
					<h2 className="text-2xl font-semibold mb-6">Manual Entry</h2>
					{/* Replace the following with your manual entry form */}
					<p className="mb-4">Manual entry form goes here.</p>
					<button
						onClick={() => setViewMode(null)}
						className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
						Back
					</button>
				</div>
			</Layout>
		);
	}

	// --- Render the Template Flow ---
	if (viewMode === 'template') {
		// 1. If no template meta exists, show a message.
		if (templateMeta.length === 0) {
			return (
				<Layout>
					<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
						<h1 className="text-2xl font-bold">No Template Found</h1>
						<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
							<p>You do not have any template meta data available.</p>
							<p>
								Please create a template meta before creating a new template.
							</p>
							<button
								onClick={() => setViewMode(null)}
								className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
								Go Back
							</button>
						</div>
					</div>
				</Layout>
			);
		}

		// 2. If no template is selected yet, show the template selection list.
		if (!selectedTemplate) {
			return (
				<Layout>
					<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
						<h1 className="text-2xl font-bold">Select a Template</h1>
						<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
							<p className="mb-4">
								Please select one of your existing templates before creating a
								new one.
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
							<button
								onClick={() => setViewMode(null)}
								className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
								Go Back
							</button>
						</div>
					</div>
				</Layout>
			);
		}

		// 3. If the summary view is active, show the summary.
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
											<strong>Time:</strong> {entry.start_time} -{' '}
											{entry.end_time}
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
									className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
									onClick={() => setShowSummary(false)}>
									Back
								</button>
								<button
									className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
									onClick={handleSendData}>
									Send
								</button>
							</div>
						</div>
					</div>
				</Layout>
			);
		}

		// 4. Otherwise, show the main create-template form.
		// Filter entries for the current day.
		const currentDayEntries = entries.filter(
			(entry) => entry.weekday === currentDay
		);

		return (
			<Layout>
				<div className="flex flex-col justify-center items-center mb-8 mt-4 space-y-4">
					<h1 className="text-2xl font-bold">Create Shift Template</h1>
					<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
						{/* Display selected template info */}
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
								className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600 transition"
								onClick={handlePreviousDay}
								disabled={currentDay === 1 && !showSummary}>
								{currentDay === 1 ? 'Start' : 'Previous'}
							</button>
							<button
								className={`${
									currentDay === 7 ? 'bg-purple-500' : 'bg-blue-500'
								} text-white px-4 py-2 rounded hover:${
									currentDay === 7 ? 'bg-purple-600' : 'bg-blue-600'
								} transition`}
								onClick={handleNextDay}>
								{currentDay === 7 ? 'Continue' : 'Next'}
							</button>
						</div>

						{/* Add Entry Button */}
						{currentDay <= 7 && (
							<div className="mt-6 text-center">
								<button
									className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
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
													shift_type_id: selectedShift?.shift_type_id || '',
													title: selectedShift ? selectedShift.name_short : '',
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
										<label className="block text-sm font-medium">
											End Time
										</label>
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
											className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
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
												className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
												onClick={() => {
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
												className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
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

	// --- Render the initial two-button selection ---
	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
				<h2 className="text-2xl font-semibold mb-6">Calendar</h2>
				<div className="flex space-x-6">
					<button
						onClick={handleTemplateClick}
						className="w-32 h-32 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
						Template
					</button>
					<button
						onClick={handleManualClick}
						className="w-32 h-32 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
						Manual
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default CreateSchedule;
