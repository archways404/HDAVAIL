import React, { useContext, useState, useEffect } from 'react';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import DisplayStatus from './DisplayStatus';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ConsentContext } from '../context/ConsentContext';

import { AppSidebar } from '@/components/appsidebar';

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);

	if (user) {
		return (
			<div className="grid grid-cols-[15rem_auto] gap-2 h-screen">
				{/* Sidebar (Fixed Width) */}
				<div className="w-60">
					<AppSidebar
						user={user}
						consent={consent}
					/>
				</div>

				{/* Main Content (Takes Remaining Space) */}
				<div className="flex flex-col flex-1 min-h-screen">
					{/* Navbar (Fixed at the Top of the Main Content) */}
					<div className="h-16 flex items-center bg-gray-100 dark:bg-gray-900 shadow-md">
						<Navbar />
					</div>

					{/* Scrollable Main Content */}
					<main className="flex-1 overflow-auto">{children}</main>
				</div>

				{/* Other Global Components */}
				<Toaster />
			</div>
		);
	} else {
		return (
			<div className="h-screen">
				{/* Main Content (Takes Remaining Space) */}
				<div className="flex flex-col flex-1 min-h-screen">
					{/* Navbar (Fixed at the Top of the Main Content) */}
					<div className="h-16 w-full flex items-center bg-gray-100 dark:bg-gray-900 shadow-md">
						<Navbar />
					</div>

					{/* Scrollable Main Content */}
					<main className="flex-1 overflow-auto">{children}</main>
				</div>

				{/* Other Global Components */}
				<Toaster />
			</div>
		);
	}
}

export default Layout;
