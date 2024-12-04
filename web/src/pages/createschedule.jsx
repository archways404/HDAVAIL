import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import Layout from '../components/Layout';

function CreateSchedule() {
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const [isTemplateSelected, setIsTemplateSelected] = useState(false); // Phase tracking
	const [selectedTemplate, setSelectedTemplate] = useState(''); // Selected template ID
	const [templates, setTemplates] = useState([]); // Templates list
	const [templateEntries, setTemplateEntries] = useState([]); // Template entries
	const [currentMonth, setCurrentMonth] = useState(() => new Date()); // Current month

	// Fetch templates on component mount
	const fetchTemplates = async () => {
		try {
			let url =
				import.meta.env.VITE_BASE_ADDR + '/templates-by-user/' + user.uuid;
			const response = await fetch(url);
			const data = await response.json();
			setTemplates(data);
		} catch (error) {
			console.error('Error fetching templates:', error);
		}
	};

	useEffect(() => {
		fetchTemplates();
	}, []);

	// Fetch template entries when a template is selected
	const fetchTemplateEntries = async (templateId) => {
		try {
			let url = `${
				import.meta.env.VITE_BASE_ADDR
			}/template-entries/${templateId}`;
			const response = await fetch(url);
			const data = await response.json();
			setTemplateEntries(data);
		} catch (error) {
			console.error('Error fetching template entries:', error);
			setTemplateEntries([]); // Reset if an error occurs
		}
	};

	const handleTemplateSelection = () => {
		if (selectedTemplate) {
			fetchTemplateEntries(selectedTemplate); // Fetch data for the selected template
			setIsTemplateSelected(true); // Proceed to the calendar view
		}
	};

	// Get the dates for the calendar view
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

	// Map template entries to weekdays
	const entriesByWeekday = templateEntries.reduce((acc, entry) => {
		if (!acc[entry.weekday]) {
			acc[entry.weekday] = [];
		}
		acc[entry.weekday].push(entry);
		return acc;
	}, {});

	// Generate a list of months
	const getAvailableMonths = () => {
		const now = new Date();
		return Array.from({ length: 12 }, (_, index) => {
			const month = new Date(now.getFullYear(), now.getMonth() + index, 1);
			return {
				label: month.toLocaleString('default', {
					month: 'long',
					year: 'numeric',
				}),
				value: month,
			};
		});
	};

	const availableMonths = getAvailableMonths();

	return (
		<Layout>
			<div className="container mx-auto p-4 max-w-screen-xl">
				{/* Phase: Template and Month Selector */}
				{!isTemplateSelected ? (
					<div className="flex flex-col items-center space-y-6">
						<h1 className="text-2xl font-bold text-white">Select a Template</h1>
						<select
							className="p-2 rounded bg-gray-800 text-white border border-gray-700"
							value={selectedTemplate}
							onChange={(e) => setSelectedTemplate(e.target.value)}>
							<option
								value=""
								disabled>
								-- Select a Template --
							</option>
							{templates.map((template) => (
								<option
									key={template.template_id}
									value={template.template_id}>
									{template.template_name}
								</option>
							))}
						</select>
						<h2 className="text-lg font-semibold text-white">Select a Month</h2>
						<select
							className="p-2 rounded bg-gray-800 text-white border border-gray-700"
							value={currentMonth.toISOString()}
							onChange={(e) => setCurrentMonth(new Date(e.target.value))}>
							{availableMonths.map((month, index) => (
								<option
									key={index}
									value={month.value.toISOString()}>
									{month.label}
								</option>
							))}
						</select>
						<Button
							disabled={!selectedTemplate}
							onClick={handleTemplateSelection}
							className={`p-4 ${
								selectedTemplate ? 'bg-green-600' : 'bg-gray-600'
							} text-white rounded shadow-md hover:bg-green-700`}>
							Generate Calendar
						</Button>
					</div>
				) : (
					/* Phase: Calendar View */
					<>
						<div className="flex justify-center items-center mb-8 mt-4 space-x-6">
							<div className="text-center">
								<div className="text-2xl font-bold text-white">
									{currentMonth.getFullYear()}
								</div>
								<div className="text-lg text-gray-300">
									{currentMonth.toLocaleString('default', { month: 'long' })}
								</div>
							</div>
						</div>
						<div className="grid grid-cols-7 gap-4 bg-gray-800 rounded-lg shadow-lg p-6">
							{datesOfMonth.map((date, index) => {
								const dayOfWeek = new Date(date).getDay(); // Get weekday (0 = Sunday, ..., 6 = Saturday)
								const entriesForDay = entriesByWeekday[dayOfWeek] || []; // Get entries for this weekday
								return (
									<div
										key={index}
										className="bg-gray-900 p-4 rounded-lg text-white text-center">
										<div className="font-bold">
											{new Date(date).toLocaleDateString('default', {
												weekday: 'short',
												month: 'short',
												day: 'numeric',
											})}
										</div>
										{entriesForDay.length > 0 ? (
											<ul className="mt-2">
												{entriesForDay.map((entry, idx) => (
													<li
														key={idx}
														className="text-sm text-gray-300">
														<div className="font-medium text-white">
															{entry.slot_name_short}
														</div>
														<div>
															{entry.start_time} - {entry.end_time}
														</div>
													</li>
												))}
											</ul>
										) : (
											<div className="text-gray-500 text-sm">No entries</div>
										)}
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</Layout>
	);
}

export default CreateSchedule;

