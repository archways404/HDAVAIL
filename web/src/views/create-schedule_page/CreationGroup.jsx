// CreationGroup.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const CreationGroup = ({ onSelectGroup, goBack }) => {
	const { user } = useContext(AuthContext);
	const [scheduleGroups, setScheduleGroups] = useState([]);

	useEffect(() => {
		const fetchScheduleGroups = async () => {
			if (!user?.uuid) return;
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getScheduleGroups?user_id=${
						user.uuid
					}`
				);
				const data = await response.json();
				setScheduleGroups(data);
				console.log('data', data);
			} catch (error) {
				console.error('Error fetching groups:', error);
			}
		};

		fetchScheduleGroups();
	}, [user]);

	const handleGroupSelect = (group) => {
		// Pass the selected group back to the parent.
		onSelectGroup({
			id: group.group_id,
			name: group.name,
		});
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
				<h2 className="text-2xl font-semibold mb-6">Select a Group</h2>
				<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
					{scheduleGroups.length === 0 ? (
						<p>No groups available.</p>
					) : (
						<ul className="space-y-2">
							{scheduleGroups.map((group) => (
								<li
									key={group.group_id}
									className="p-4 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
									onClick={() => handleGroupSelect(group)}>
									<p>
										<strong>{group.name}</strong>
									</p>
									<p>ID: {group.group_id}</p>
								</li>
							))}
						</ul>
					)}
					<button
						onClick={goBack}
						className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
						Back
					</button>
				</div>
			</div>
		</Layout>
	);
};

export default CreationGroup;
