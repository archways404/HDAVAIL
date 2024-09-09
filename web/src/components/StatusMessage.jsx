import React, { useState } from 'react';

function StatusMessage({ message, type }) {
	const [visible, setVisible] = useState(true);

	const handleClose = () => {
		setVisible(false);
	};

	let bgColor;
	switch (type) {
		case 'info':
			bgColor = 'bg-blue-100 text-blue-800';
			break;
		case 'warning':
			bgColor = 'bg-yellow-100 text-yellow-800';
			break;
		case 'error':
			bgColor = 'bg-red-100 text-red-800';
			break;
		default:
			bgColor = 'bg-gray-100 text-gray-800';
	}

	if (!visible) return null;

	return (
		<div
			className={`p-4 rounded-md shadow-md ${bgColor} relative max-w-md mx-auto my-4`}>
			<span>{message}</span>
			<button
				className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
				onClick={handleClose}
				aria-label="Close">
				&times;
			</button>
		</div>
	);
}

export default StatusMessage;
