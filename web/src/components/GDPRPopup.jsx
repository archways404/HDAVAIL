import React, { useState } from 'react';

const GDPRPopup = ({ onDecision }) => {
	const [showPopup, setShowPopup] = useState(true);

	const handleAccept = () => {
		onDecision('accepted');
		setShowPopup(false);
	};

	if (!showPopup) {
		return null;
	}

	return (
		<div className="gdpr-popup fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
			<div className="bg-gray-900 text-white max-w-lg w-full p-8 rounded-lg shadow-xl">
				<h2 className="text-xl font-semibold mb-4">
					Cookies Required for Authentication
				</h2>
				<p className="text-sm mb-6">
					We use cookies to store your authentication token securely. This is
					necessary to keep you logged in and provide access to your account.
				</p>
				<p className="text-sm mb-6">
					By continuing to use this website, you consent to the use of these
					cookies as required by GDPR.
				</p>
				<br></br>
				<div className="flex justify-center">
					<button
						onClick={handleAccept}
						className="px-6 py-2 rounded-md bg-green-500 text-white hover:bg-green-400 transition ease-in-out">
						Accept and Continue
					</button>
				</div>
			</div>
		</div>
	);
};

export default GDPRPopup;
