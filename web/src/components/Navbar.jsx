import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
	const { theme } = useContext(ThemeContext);
	const { user } = useContext(AuthContext);

	if (!user) {
		return null;
	}

	const renderLinksForUserType = () => {
		switch (user.type) {
			case 'worker':
				return (
					<>
						<li>
							<Link
								to="/schedule"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Schedule
							</Link>
						</li>
					</>
				);
			case 'admin':
				return (
					<>
						<li>
							<Link
								to="/invite"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Invite
							</Link>
						</li>
						<li>
							<Link
								to="/calendarlink"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								CalendarLink
							</Link>
						</li>
						<li>
							<Link
								to="/manage-users"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Manage Users
							</Link>
						</li>
						<li>
							<Link
								to="/schedule"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Schedule
							</Link>
						</li>
						<li>
							<Link
								to="/create-schedule"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								create
							</Link>
						</li>
						<li>
							<Link
								to="/serverinfo"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Server Info
							</Link>
						</li>
						<li>
							<Link
								to="/server-panel"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Server-Panel
							</Link>
						</li>
					</>
				);
			case 'maintainer':
				return (
					<>
						<li>
							<Link
								to="/dashboard"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Dashboard
							</Link>
						</li>
						<li>
							<Link
								to="/server-panel"
								className={`${
									theme === 'dark'
										? 'hover:text-gray-400'
										: 'hover:text-gray-600'
								}`}>
								Server-Panel
							</Link>
						</li>
					</>
				);
		}
	};

	return (
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
							theme === 'dark' ? 'hover:text-gray-400' : 'hover:text-gray-600'
						}`}>
						Home
					</Link>
				</li>
				<li>
					<Link
						to="/settings"
						className={`${
							theme === 'dark' ? 'hover:text-gray-400' : 'hover:text-gray-600'
						}`}>
						Settings
					</Link>
				</li>

				{/* Conditionally render links based on user type */}
				{renderLinksForUserType()}

				<li>
					<Link
						to="/logout"
						className={`${
							theme === 'dark' ? 'hover:text-gray-400' : 'hover:text-gray-600'
						}`}>
						Logout
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Navbar;
