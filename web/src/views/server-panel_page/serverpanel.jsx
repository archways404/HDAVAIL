import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';

const ServerPanel = () => {
	const { user } = useContext(AuthContext);
	const [updateMessage, setUpdateMessage] = useState(''); // For displaying the update message
	const [isUpdating, setIsUpdating] = useState(false); // To show a loading indicator

	// Function to trigger server update twice
	const handleUpdate = async () => {
		if (isUpdating) return; // Prevent duplicate clicks
		setIsUpdating(true);
		setUpdateMessage('Updating server...');

		try {
			// First call to the server
			await fetch(import.meta.env.VITE_BASE_ADDR + '/update', {
				method: 'POST',
				credentials: 'include',
			});

			// Wait 1 second before the second call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Second call to the server
			const response = await fetch(import.meta.env.VITE_BASE_ADDR + '/update', {
				method: 'POST',
				credentials: 'include',
			});

			const data = await response.json();

			// Update message based on response
			if (response.ok) {
				setUpdateMessage(data.message || 'Server updated successfully.');
			} else {
				setUpdateMessage(`Error: ${data.error || 'Unknown error occurred'}`);
			}
		} catch (error) {
			console.error('Failed to update server:', error);
			setUpdateMessage('An error occurred. Check the console for details.');
		} finally {
			setIsUpdating(false);
		}
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col items-center min-h-screen text-center w-full">
				<p className="text-lg mb-4">Server Panel</p>

				<Button
					onClick={handleUpdate}
					className="bg-blue-500 hover:bg-blue-700 text-white mb-4"
					disabled={isUpdating}>
					{isUpdating ? 'Updating...' : 'Update Server'}
				</Button>

				{/* Display the server response */}
				{updateMessage && (
					<div className="mt-4 text-gray-800 p-4 border rounded bg-gray-100">
						<p>{updateMessage}</p>
					</div>
				)}
			</div>
		</Layout>
	);
};

export default ServerPanel;
