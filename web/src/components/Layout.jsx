import React, { useContext, useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import GDPRPopup from '@/components/GDPRPopup';

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const [cookieConsent, setCookieConsent] = useState(null);

	// Check cookie consent on mount
	useEffect(() => {
		const consent = localStorage.getItem('cookieConsent');
		setCookieConsent(consent);
	}, []);

	const handleCookieDecision = (decision) => {
		localStorage.setItem('cookieConsent', decision);
		setCookieConsent(decision);
	};

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

			{/* GDPR Popup */}
			{cookieConsent === null || cookieConsent === 'denied' ? (
				<GDPRPopup onDecision={handleCookieDecision} />
			) : (
				<>
					{/* Main Content */}
					{children}
				</>
			)}

			{/* Toasts */}
			<Toaster />
		</div>
	);
}

export default Layout;
