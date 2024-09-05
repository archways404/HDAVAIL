import React, { useContext } from 'react';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';
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
			{user && (
				<nav
					className={`${
						theme === 'dark'
							? 'bg-gray-800 text-white'
							: 'bg-gray-200 text-gray-900'
					} p-4`}>
					<ul className="flex space-x-4">
						<li>
							<Link
								to="/welcome"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/profile"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Profile
							</Link>
						</li>
						<li>
							<Link
								to="/logout"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Logout
							</Link>
						</li>
					</ul>
				</nav>
			)}

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
