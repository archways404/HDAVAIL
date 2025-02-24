import { useState, useContext, useEffect } from 'react';
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

function ModifyTemplate({ templateId, onClose }) {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [shiftTypes, setShiftTypes] = useState([]);
	const [currentDay, setCurrentDay] = useState(1);
	const [entries, setEntries] = useState([]);

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
				setEntries(data);
			} catch (error) {
				console.error('Error fetching template data:', error);
			}
		};

		fetchTemplateData();
	}, [templateId]);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
			<div className="w-full max-w-3xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-y-auto">
				{/* Modal Header */}
				<div className="flex justify-between items-center border-b pb-4">
					<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
						Modify Template
					</h2>
					{/* Back Button */}
					<button
						className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
						onClick={onClose}>
						← Back
					</button>
				</div>

				{/* Current Day */}
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">
					Day: {daysOfWeek[currentDay - 1].name}
				</h3>

				{/* Navigation Buttons */}
				<div className="flex justify-between mt-4">
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
						onClick={() => setCurrentDay((prev) => Math.max(1, prev - 1))}>
						Previous
					</button>
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded"
						onClick={() => setCurrentDay((prev) => Math.min(7, prev + 1))}>
						Next
					</button>
				</div>

				{/* Entries List */}
				<div className="mt-4">
					{entries.length === 0 ? (
						<p className="text-gray-600 dark:text-gray-300">
							No entries for today.
						</p>
					) : (
						<ul className="space-y-2">
							{entries.map((entry, index) => (
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
										<button className="bg-yellow-500 text-white px-2 py-1 rounded">
											Edit
										</button>
										<button className="bg-red-500 text-white px-2 py-1 rounded">
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

export default ModifyTemplate;
