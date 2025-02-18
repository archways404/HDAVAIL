import React from 'react';

function GroupSelector({ groups, onGroupSelect }) {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-600">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white">
					Select a Group
				</h2>
				<select
					onChange={(e) => onGroupSelect(e.target.value)}
					defaultValue=""
					className="w-full mt-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
					<option
						value=""
						disabled>
						Select a group
					</option>
					{groups.map((group) => (
						<option
							key={group.id}
							value={group.id}
							className="text-gray-700 dark:text-gray-200">
							{group.name || group.id}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

export default GroupSelector;
