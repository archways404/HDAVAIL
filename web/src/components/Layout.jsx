import React, { useContext, useEffect } from 'react';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ConsentContext } from '../context/ConsentContext';

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	const preferences = CookieConsent.getUserPreferences();

	console.log('pref', preferences.acceptedCategories);

	console.log('consnt', consent.acceptedCategories);

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

			{/* Button to manually trigger Cookie Consent UI */}
			<button
				type="button"
				className="absolute bottom-4 left-4 px-4 py-2 bg-stone-950 hover:bg-red-600 text-white rounded-md shadow-md transition"
				onClick={() => window.CookieConsent?.showPreferences()}>
				<MdOutlinePrivacyTip className="text-xl" />
			</button>

			{/* Main Content */}
			{children}

			{/* Toasts */}
			<Toaster />
		</div>
	);
}

export default Layout;
