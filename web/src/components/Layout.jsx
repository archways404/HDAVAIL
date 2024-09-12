// Layout.js
import React, { useContext } from 'react';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar'; // Import the Navbar component
import { ThemeContext } from '../context/ThemeContext';

function Layout({ children, user }) {
	const { theme } = useContext(ThemeContext);

	return (
		<div
			className={`min-h-screen ${
				theme === 'dark'
					? 'bg-gray-900 text-gray-300'
					: 'bg-gray-100 text-gray-700'
			}`}>
			{/* Navbar */}
			<Navbar user={user} />

			{/* Theme Toggle */}
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>

			{/* Main Content */}
			{children}
		</div>
	);
}

export default Layout;
