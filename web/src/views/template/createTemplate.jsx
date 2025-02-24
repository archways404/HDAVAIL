import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const daysOfWeek = [
	{ id: 1, name: 'Monday' },
	{ id: 2, name: 'Tuesday' },
	{ id: 3, name: 'Wednesday' },
	{ id: 4, name: 'Thursday' },
	{ id: 5, name: 'Friday' },
	{ id: 6, name: 'Saturday' },
	{ id: 7, name: 'Sunday' },
];

function CreateTemplate({ templateId, onClose }) {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	console.log('indata', templateId);

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

	// Fetch shift types
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

	// Fetch template data
	useEffect(() => {
		const fetchTemplateData = async () => {
			if (!templateId) return;
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BASE_ADDR
					}/getTemplateData?template_id=${templateId}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch template data');
				}
				const data = await response.json();
				if (data.length > 0) {
					const updatedData = data.map((entry) => {
						const shift = shiftTypes.find(
							(s) => s.shift_type_id === entry.shift_type_id
						);
						return {
							template_id: templateId,
							shift_type_id: entry.shift_type_id,
							title: shift ? shift.name_short : entry.title,
							start_time: entry.start_time,
							end_time: entry.end_time,
							weekday: entry.weekday,
						};
					});
					setEntries(updatedData);
				}
			} catch (error) {
				console.error('Error fetching template data:', error);
			}
		};

		if (shiftTypes.length > 0) {
			fetchTemplateData();
		}
	}, [templateId, shiftTypes]);

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
			template_id: templateId,
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

	const currentDayEntries = entries.filter(
		(entry) => entry.weekday === currentDay
	);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
			<div className="w-full max-w-3xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-y-auto">
				{/* Modal Header */}
				<div className="flex justify-between items-center border-b pb-4">
					<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
						Modify Template
					</h2>
				</div>

				{/* Current Day */}
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">
					Day: {daysOfWeek[currentDay - 1].name}
				</h3>

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

				{/* Entries List */}
				<div className="mt-4">
					{currentDayEntries.length === 0 ? (
						<p className="text-gray-600 dark:text-gray-300">
							No entries for today.
						</p>
					) : (
						<ul className="space-y-2">
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
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}

export default CreateTemplate;
