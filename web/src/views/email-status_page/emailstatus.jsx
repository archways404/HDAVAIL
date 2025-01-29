import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EmailStatus = () => {
	// States for adding an email
	const [emailToAdd, setEmailToAdd] = useState('');
	const [addEmailError, setAddEmailError] = useState(null);
	const [addEmailSuccess, setAddEmailSuccess] = useState(null);

	// State for email list
	const [emailList, setEmailList] = useState([]);
	const [emailListError, setEmailListError] = useState(null);

	// Fetch emails on load or update
	const fetchEmails = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_MONITOR_SERVER_BASE_ADDR + '/emails',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						password: import.meta.env.VITE_MONITOR_SERVER_SECRET,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to fetch email list.');
			}

			const data = await response.json();
			setEmailList(data.emails || []);
			setEmailListError(null);
		} catch (error) {
			setEmailListError(error.message);
		}
	};

	useEffect(() => {
		fetchEmails();
	}, []);

	// Handle adding an email
	const handleAddEmail = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(
				import.meta.env.VITE_MONITOR_SERVER_BASE_ADDR + '/emails/add',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: emailToAdd,
						password: import.meta.env.VITE_MONITOR_SERVER_SECRET,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to add email.');
			}

			const data = await response.json();
			setAddEmailSuccess(data.message || 'Email added successfully!');
			setAddEmailError(null);
			setEmailToAdd('');
			fetchEmails(); // Refresh email list
		} catch (error) {
			setAddEmailError(error.message);
			setAddEmailSuccess(null);
		}
	};

	// Handle deleting an email
	const handleDeleteEmail = async (email) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_MONITOR_SERVER_BASE_ADDR}/emails/delete`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email,
						password: import.meta.env.VITE_MONITOR_SERVER_SECRET,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to delete email.');
			}

			fetchEmails(); // Refresh email list
		} catch (error) {
			console.error(error.message);
		}
	};

	return (
		<Layout>
			<div className="p-6 max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
				<h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
					Manage Notification Emails
				</h2>

				{/* Add Email Form */}
				<form
					onSubmit={handleAddEmail}
					className="space-y-4 mb-6">
					<div>
						<Label
							htmlFor="addEmail"
							className="text-gray-700 dark:text-gray-300">
							Add Email:
						</Label>
						<Input
							id="addEmail"
							type="email"
							value={emailToAdd}
							onChange={(e) => setEmailToAdd(e.target.value)}
							required
							placeholder="Enter email"
							className="mt-1"
						/>
					</div>
					<Button
						type="submit"
						className="w-full bg-blue-500 dark:bg-blue-700 text-white">
						Add Email
					</Button>
				</form>

				{addEmailError && (
					<div className="text-red-500 mt-2">{addEmailError}</div>
				)}
				{addEmailSuccess && (
					<div className="text-green-500 mt-2">{addEmailSuccess}</div>
				)}

				{/* Email List */}
				<div>
					<h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
						Notification List
					</h3>

					{emailListError && (
						<div className="text-red-500">{emailListError}</div>
					)}

					<ul className="space-y-2">
						{emailList.map((email) => (
							<li
								key={email}
								className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded">
								<span className="text-gray-700 dark:text-gray-300">
									{email}
								</span>
								<Button
									onClick={() => handleDeleteEmail(email)}
									className="bg-red-500 dark:bg-red-700 text-white">
									Delete
								</Button>
							</li>
						))}
					</ul>
				</div>
			</div>
		</Layout>
	);
};

export default EmailStatus;
