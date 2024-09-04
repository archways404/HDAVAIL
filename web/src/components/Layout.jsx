import React from 'react';
import ThemeToggle from './ThemeToggle';

function Layout({ children }) {
	return (
		<div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			{children}
		</div>
	);
}

export default Layout;
