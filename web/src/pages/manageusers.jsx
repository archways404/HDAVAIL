import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { AuthContext } from '../context/AuthContext';

const ManageUsers = () => {
	const { user } = useContext(AuthContext);

	// State to store the list of users
	const [users, setUsers] = useState([]);
	const [role, setRole] = useState(''); // Empty string means no filtering
	const [searchQuery, setSearchQuery] = useState('');

	// To track any errors or success messages
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	// Function to fetch users based on role
	const fetchUsers = async (role = '') => {
		setLoading(true);
		setError(null);

		try {
			// Decide which URL to use based on the role
			const url =
				role === 'worker'
					? `${import.meta.env.VITE_FETCH_USERS_W}`
					: role === 'admin'
					? `${import.meta.env.VITE_FETCH_USERS_A}`
					: role === 'maintainer'
					? `${import.meta.env.VITE_FETCH_USERS_M}`
					: `${import.meta.env.VITE_FETCH_USERS}`;

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to fetch users.');
			}

			const data = await response.json();
			setUsers(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Fetch all users by default when the component mounts
	useEffect(() => {
		fetchUsers();
	}, []);

	// Handle role change
	const handleRoleChange = (value) => {
		setRole(value);
		fetchUsers(value);
	};

	// Handle search filtering on the client side by username, first_name, and last_name
	const filteredUsers = users.filter((user) =>
		[user.username, user.first_name, user.last_name]
			.join(' ')
			.toLowerCase()
			.includes(searchQuery.toLowerCase())
	);

	return (
		<Layout>
			{loading ? (
				<LoadingScreen /> // Render the LoadingScreen component while loading
			) : (
				<div className="manage-users p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
					<h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-200 text-center">
						Manage Users
					</h2>

					{/* Search Field */}
					<div className="mb-4">
						<Label
							htmlFor="search"
							className="text-gray-700 dark:text-gray-300">
							Search
						</Label>
						<Input
							id="search"
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search for user"
							className="mt-1 w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600"
						/>
					</div>

					{/* Role Selection */}
					<div className="mb-6">
						<Label
							htmlFor="role"
							className="text-gray-700 dark:text-gray-300">
							Filter by Role
						</Label>
						<Select
							onValueChange={handleRoleChange}
							value={role}
							className="mt-1 w-full">
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="worker">Worker</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="maintainer">Maintainer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* User List */}
					{error ? (
						<p className="text-center text-red-500 font-semibold">{error}</p>
					) : (
						<ul className="space-y-6">
							{filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<li
										key={user.uuid}
										className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
										<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
											{user.first_name} {user.last_name}
										</p>
										<p className="text-gray-700 dark:text-gray-400">
											{user.username}
										</p>
										<Link to={`/user/${user.uuid}`}>
											<Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
												View Details
											</Button>
										</Link>
									</li>
								))
							) : (
								<p className="text-center text-lg text-gray-600 dark:text-gray-300">
									No users found.
								</p>
							)}
						</ul>
					)}
				</div>
			)}
		</Layout>
	);
};

export default ManageUsers;
