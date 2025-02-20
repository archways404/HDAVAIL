import React, { useState, useContext } from 'react';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import DisplayStatus from './DisplayStatus';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ConsentContext } from '../context/ConsentContext';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SideBar } from '@/components/sidebar';

function Layout({ children }) {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);
	const { consent } = useContext(ConsentContext);
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<div
			className={`min-h-screen flex ${
				theme === 'dark'
					? 'bg-gray-900 text-gray-300'
					: 'bg-gray-100 text-gray-700'
			}`}>
			<SidebarProvider>
				{/* Sidebar - Expand/Collapse */}
				<div
					className={`${
						isSidebarOpen ? 'w-64' : 'w-16'
					} h-screen fixed top-0 left-0 flex flex-col bg-gray-800 text-white transition-all duration-300`}>
					{/* Sidebar Content */}
					{isSidebarOpen && <SideBar />}
				</div>

				{/* Main Content Wrapper */}
				<div
					className={`flex flex-col transition-all duration-300 ${
						isSidebarOpen ? 'ml-64' : 'ml-16'
					} flex-grow`}>
					{/* Navbar - Full width relative to content */}
					<div className="sticky top-0 z-40 bg-gray-700 text-white shadow-md flex justify-between items-center px-4 py-2">
						{/* Sidebar Toggle Duplicate */}
						<button
							onClick={toggleSidebar}
							className="bg-gray-600 px-3 py-1 rounded-md hover:bg-gray-500 cursor-pointer">
							☰
						</button>

						{/* Navbar */}
						<Navbar />

						{/* Theme Toggle - Top Right */}
						<ThemeToggle />
					</div>

					{/* Page Content - Should expand dynamically */}
					<div className="relative flex-grow p-4">{children}</div>

					{/* Toast Notifications */}
					<Toaster />
				</div>
			</SidebarProvider>

			{/* Sticky Cookie Button - Always in Bottom Left */}
			<button
				type="button"
				className="fixed bottom-10 right-10 px-4 py-4 bg-stone-950 hover:bg-red-600 text-white rounded-md shadow-md transition"
				onClick={() => window.CookieConsent?.showPreferences()}>
				<MdOutlinePrivacyTip className="text-xl" />
			</button>

			{/* Status Messages - Bottom Right Notifications (Floating) */}
			{/*  

			<div className="fixed bottom-4 right-4 z-50">
				<DisplayStatus />
			</div>
			*/}
		</div>
	);
}

export default Layout;
