import React, { useState, useEffect } from 'react';
import { MdInfoOutline, MdErrorOutline, MdWarningAmber } from 'react-icons/md';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';

function DisplayStatus() {
	const [statusMessages, setStatusMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch status messages from the backend
	useEffect(() => {
		const fetchStatusMessages = async () => {
			try {
				const response = await fetch(
					import.meta.env.VITE_BASE_ADDR + '/status'
				);
				if (!response.ok) {
					throw new Error('Failed to fetch status messages');
				}
				const data = await response.json();

				// Sort messages by `sort_order` (lowest first)
				const sortedData = data.sort((a, b) => a.sort_order - b.sort_order);
				setStatusMessages(sortedData);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchStatusMessages();
	}, []);

	if (loading) return <div></div>;

	if (error) {
		return (
			<div className="w-full p-4 bg-red-500 text-white text-center">
				The server is currently offline
			</div>
		);
	}

	return (
		<div className="w-full">
			{statusMessages.length === 0 ? (
				<div></div>
			) : (
				statusMessages.map(
					({ status_id, description, type, color, created_at, updated_at }) => {
						// Define default colors based on type
						const typeColors = {
							info: 'bg-blue-500 text-white',
							warning: 'bg-yellow-400 text-black',
							error: 'bg-red-500 text-white',
							success: 'bg-green-500 text-white',
							default: 'bg-gray-500 text-white',
						};

						// Select the correct icon for the type
						const typeIcons = {
							info: <MdInfoOutline className="text-lg" />,
							warning: <MdWarningAmber className="text-lg" />,
							error: <MdErrorOutline className="text-lg" />,
							success: <IoMdCheckmarkCircleOutline className="text-lg" />,
							default: <MdInfoOutline className="text-lg" />, // Default fallback icon
						};

						// Determine most recent timestamp
						const createdDate = new Date(created_at);
						const updatedDate = updated_at ? new Date(updated_at) : createdDate;
						const isUpdated = updated_at && updatedDate > createdDate;

						const dateToUse = isUpdated ? updatedDate : createdDate;
						const timestampType = isUpdated ? 'updated' : 'created';

						// Format time
						const formattedTime = dateToUse.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						});

						// Format date (DD-MM-YYYY)
						const formattedDate = `${dateToUse
							.getDate()
							.toString()
							.padStart(2, '0')}-${(dateToUse.getMonth() + 1)
							.toString()
							.padStart(2, '0')}-${dateToUse.getFullYear()}`;

						// Check if date is today
						const today = new Date();
						const isToday = dateToUse.toDateString() === today.toDateString();

						// Final timestamp format: If today → HH:mm | Else → HH:mm | DD-MM-YYYY
						const timestampText = isToday
							? `${timestampType} ${formattedTime}`
							: `${timestampType} ${formattedTime} | ${formattedDate}`;

						// Use inline style if color is provided, otherwise use predefined Tailwind class
						const bgStyle = color
							? { backgroundColor: color, color: 'white' }
							: null;
						const className = color
							? 'w-full p-2 flex flex-row items-center gap-2 shadow-md'
							: `w-full p-2 flex flex-row items-center gap-2 shadow-md ${
									typeColors[type] || typeColors.default
							  }`;

						return (
							<div
								key={status_id}
								className={className}
								style={bgStyle}>
								{/* Icon */}
								{typeIcons[type] || typeIcons.default}

								{/* Message Content */}
								<span className="font-medium">{description}</span>

								{/* Timestamp */}
								<span className="text-xs opacity-80">{timestampText}</span>
							</div>
						);
					}
				)
			)}
		</div>
	);
}

export default DisplayStatus;
