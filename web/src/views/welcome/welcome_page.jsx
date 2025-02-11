import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';

const Welcome = () => {
	const { user } = useContext(AuthContext);
	console.log('user', user);

	if (!user) {
		return null;
	}

	// Format the user's name
	const formattedFirstName =
		user.first.charAt(0).toUpperCase() + user.first.slice(1);
	const formattedLastName = user.last.charAt(0).toUpperCase();

	return (
		<Layout>
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
				<div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
					<h1 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
						Welcome, {formattedFirstName} {formattedLastName}.
					</h1>
					<div className="text-gray-600 dark:text-gray-300 text-sm">
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								UUID:
							</span>{' '}
							{user.uuid}
						</p>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Email:
							</span>{' '}
							{user.email}
						</p>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Role:
							</span>{' '}
							{user.role}
						</p>
						<p>
							<span className="font-semibold text-gray-800 dark:text-white">
								Groups:
							</span>{' '}
							{user.groups && user.groups.length > 0
								? user.groups.map((group, index) => (
										<span key={group.id}>
											{group.name}
											{index < user.groups.length - 1 ? ', ' : ''}{' '}
											{/* Add comma between items */}
										</span>
								  ))
								: 'No groups'}
						</p>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Welcome;
