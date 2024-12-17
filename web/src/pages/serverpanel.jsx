import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

import { Button } from '@/components/ui/button';

const ServerPanel = () => {
	const { user } = useContext(AuthContext);

	// Function to trigger server update
	const handleUpdate = async () => {
		try {
			// Send POST request to Fastify endpoint
			const response = await fetch(import.meta.env.VITE_BASE_ADDR + '/update', {
				method: 'POST',
				credentials: 'include',
			});

			const data = await response.json();
			if (response.ok) {
				alert(data.message); // Success message from server
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error('Failed to update server:', error);
			alert('An error occurred. Check the console for details.');
		}
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="items-center min-h-screen text-center w-full">
				<p className="text-lg mb-4">Server Panel</p>
				<Button
					onClick={handleUpdate}
					className="bg-blue-500 hover:bg-blue-700 text-white">
					Update Server
				</Button>
			</div>
		</Layout>
	);
};

export default ServerPanel;
