import React, { useState } from 'react';

function StatusMessage({ message, type }) {
	const [visible, setVisible] = useState(true);

	let bgColor;
	switch (type) {
		case 'info':
			bgColor = 'bg-blue-500 text-white';
			break;
		case 'warning':
			bgColor = 'bg-yellow-400 text-black';
			break;
		case 'error':
			bgColor = 'bg-red-500 text-white';
			break;
		default:
			bgColor = 'bg-gray-500 text-white';
	}

	if (!visible) return null;

	return (
		<div
			className={`p-4 rounded-md shadow-md ${bgColor} relative max-w-md mx-auto my-4`}>
			<span>{message}</span>
		</div>
	);
}

export default StatusMessage;
