import React, { useState, useEffect } from 'react';
import StatusMessage from './StatusMessage';

function DisplayStatus() {
	const [statusMessages, setStatusMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch status messages from the backend
	useEffect(() => {
		const fetchStatusMessages = async () => {
			try {
				const response = await fetch(
					import.meta.env.VITE_BASE_ADDR + '/status/active'
				);
				if (!response.ok) {
					throw new Error('Failed to fetch status messages');
				}
				const data = await response.json();
				setStatusMessages(data);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchStatusMessages();
	}, []);

	if (loading) {
		return <div>Loading status messages...</div>;
	}

	if (error) {
		return (
			<div className="space-y-4">
				<StatusMessage
					key={'XXXXXXX'}
					message={'The server is currently offline'}
					type={'error'}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{statusMessages.length === 0 ? (
				<div>No current status messages.</div>
			) : (
				statusMessages.map((status) => (
					<StatusMessage
						key={status.id}
						message={status.message}
						type={status.type}
					/>
				))
			)}
		</div>
	);
}

export default DisplayStatus;
