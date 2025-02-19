import React, { useContext, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ConsentContext } from '../context/ConsentContext'; // Import Consent Context

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent, showConsentBanner } = useContext(ConsentContext); // ✅ Access Consent Data

	// ✅ Log only when `consent` actually changes
	useEffect(() => {
		if (consent !== null) {
			console.log('Updated Consent:', consent);
		}
	}, [consent]);

	return (
		<div
			className={`min-h-screen ${
				theme === 'dark'
					? 'bg-gray-900 text-gray-300'
					: 'bg-gray-100 text-gray-700'
			}`}>
			{/* Navbar */}
			<Navbar />

			{/* Theme Toggle */}
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			{/* Show user's cookie choices */}
			<div className="absolute top-4 left-4 bg-gray-800 text-white p-2 rounded">
				<p>Consent: {consent ? JSON.stringify(consent) : 'No consent given'}</p>
			</div>

			{/* Button to manually trigger Cookie Consent UI */}
			<button
				onClick={() => showConsentBanner()} // ✅ Now Works!
				className="absolute bottom-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-400 transition">
				Change Consent
			</button>

			{/* Main Content */}
			{children}

			{/* Toasts */}
			<Toaster />
		</div>
	);
}

export default Layout;
