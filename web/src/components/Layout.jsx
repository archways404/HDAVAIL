import React, { useContext } from 'react';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import DisplayStatus from './DisplayStatus';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ConsentContext } from '../context/ConsentContext';

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	return (
		<div
			className={`min-h-screen flex flex-col ${
				theme === 'dark'
					? 'bg-gray-900 text-gray-300'
					: 'bg-gray-100 text-gray-700'
			}`}>
			{/* Navbar - Sticks to Top */}
			<div className="sticky top-0 z-40 bg-gray-700 text-white shadow-md flex justify-between items-center px-4 py-2">
				{/* Navbar */}
				<Navbar />

				{/* Theme Toggle - Top Right */}
				<ThemeToggle />
			</div>

			{/* Page Content - Expands to Fill */}
			<div className="flex-grow p-4">{children}</div>

			{/* Toast Notifications */}
			<Toaster />

			{/* Sticky Cookie Button - Bottom Left */}
			<button
				type="button"
				className="fixed bottom-10 right-10 px-5 py-5 bg-stone-950 hover:bg-red-600 text-white rounded-md shadow-md transition"
				onClick={() => window.CookieConsent?.showPreferences()}>
				<MdOutlinePrivacyTip className="text-xl" />
			</button>

			{/* Status Messages - Bottom Right Notifications */}
			{/*  
			<div className="fixed bottom-4 right-4 z-50">
				<DisplayStatus />
			</div>
			*/}
		</div>
	);
}

export default Layout;
