// Layout.jsx
import React, { useContext } from 'react';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);

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

			{/* Main Content */}
			{children}
		</div>
	);
}

export default Layout;
