// CreateSchedule.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import CreateMethod from './CreationMethod';
import CreationTemplate from './CreationTemplate';
import CreationGroup from './CreationGroup';
import CreationDate from './CreationDate';
import CreationCalendar from './CreationCalendar';

const CreateSchedule = () => {
	const { user } = useContext(AuthContext);
	const [renderMode, setRenderMode] = useState(null);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [selectedYear, setSelectedYear] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState(null);

	if (!user) {
		return null;
	}

	switch (renderMode) {
		case 'manual':
			return (
				<Layout>
					<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
						<h2 className="text-2xl font-semibold mb-6">Manual Entry</h2>
						<p className="mb-4">Manual entry form goes here.</p>
						<button
							onClick={() => setRenderMode(null)}
							className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
							Back
						</button>
					</div>
				</Layout>
			);

		case 'template':
			if (!selectedTemplate) {
				return (
					<CreationTemplate
						onSelectTemplate={(template) => {
							setSelectedTemplate(template);
							setRenderMode('group');
						}}
						goBack={() => setRenderMode(null)}
					/>
				);
			}

		case 'group':
			if (!selectedGroup) {
				return (
					<CreationGroup
						onSelectGroup={(group) => setSelectedGroup(group)}
						goBack={() => setRenderMode(null)}
					/>
				);
			}

		case 'date':
			if (!selectedYear || !selectedMonth) {
				return (
					<CreationDate
						onSelectDate={(year, month) => {
							setSelectedYear(year);
							setSelectedMonth(month);
							// After selecting a date, go to the final view.
							setRenderMode('final');
						}}
						goBack={() => setRenderMode('group')}
					/>
				);
			}
			break;

		case 'final':
			return (
				<Layout>
					<div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
						{/* Increase the max width for a wider layout */}
						<div className="max-w-6xl mx-auto">
							<h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-8">
								Create Shift Template
							</h1>
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
								<div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
									<p className="text-lg text-gray-700 dark:text-gray-300">
										<span className="font-semibold">Using Template:</span>{' '}
										{selectedTemplate.name}
									</p>
									<p className="text-lg text-gray-700 dark:text-gray-300">
										<span className="font-semibold">Group:</span>{' '}
										{selectedGroup.name}
									</p>
									<p className="text-lg text-gray-700 dark:text-gray-300">
										<span className="font-semibold">Date:</span> {selectedMonth}
										-{selectedYear}
									</p>
								</div>
								<div className="flex flex-wrap gap-4">
									<button
										onClick={() => {
											setSelectedTemplate(null);
											setRenderMode('template');
										}}
										className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
										Change Template
									</button>
									<button
										onClick={() => {
											setSelectedGroup(null);
											setRenderMode('group');
										}}
										className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
										Change Group
									</button>
									<button
										onClick={() => {
											setSelectedYear(null);
											setSelectedMonth(null);
											setRenderMode('date');
										}}
										className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
										Change Date
									</button>
								</div>
							</div>
							{/* Calendar container: full width with increased height */}
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
								<div
									className="w-full"
									style={{ height: 'calc(100vh - 250px)' }}>
									<CreationCalendar
										selectedTemplate={selectedTemplate}
										selectedGroup={selectedGroup}
										selectedYear={selectedYear}
										selectedMonth={selectedMonth}
									/>
								</div>
							</div>
						</div>
					</div>
				</Layout>
			);

		default:
			return <CreateMethod setRenderMode={setRenderMode} />;
	}

	// Fallback (shouldn't reach here in a well-defined flow)
	return null;
};

export default CreateSchedule;

/*
const daysOfWeek = [
	{ id: 1, name: 'Monday' },
	{ id: 2, name: 'Tuesday' },
	{ id: 3, name: 'Wednesday' },
	{ id: 4, name: 'Thursday' },
	{ id: 5, name: 'Friday' },
	{ id: 6, name: 'Saturday' },
	{ id: 7, name: 'Sunday' },
];
*/
