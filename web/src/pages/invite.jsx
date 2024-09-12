import React, { useState } from 'react';
import Layout from '../components/Layout';
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

const Invite = ({ user }) => {
	// Form states
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('worker'); // default role

	// To track any errors or success messages
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		const inviteData = {
			username: username,
			email: email,
			type: role,
		};

		try {
			const response = await fetch(`${import.meta.env.VITE_INVITE}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(inviteData),
			});

			if (!response.ok) {
				throw new Error('Failed to send invite.');
			}

			// Reset form and show success message
			setUsername('');
			setEmail('');
			setRole('worker');
			setSuccess('Invite sent successfully!');
			setError(null);
		} catch (err) {
			setError(err.message);
			setSuccess(null);
		}
	};

	return (
		<Layout user={user}>
			<div className="invite-form p-6 max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
				<h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
					Send an Invite
				</h2>

				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					{/* Username Field */}
					<div>
						<Label
							htmlFor="username"
							className="text-gray-700 dark:text-gray-300">
							Username:
						</Label>
						<Input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							placeholder="Enter username"
							className="mt-1"
						/>
					</div>

					{/* Email Field */}
					<div>
						<Label
							htmlFor="email"
							className="text-gray-700 dark:text-gray-300">
							Email:
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="Enter email"
							className="mt-1"
						/>
					</div>

					{/* Role Selection */}
					<div>
						<Label
							htmlFor="role"
							className="text-gray-700 dark:text-gray-300">
							Role:
						</Label>
						<Select
							onValueChange={(value) => setRole(value)}
							value={role}
							className="mt-1">
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="worker">Worker</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="maintainer">Maintainer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						className="w-full bg-blue-500 dark:bg-blue-700 text-white">
						Send Invite
					</Button>
				</form>

				{/* Error and Success Messages */}
				{error && (
					<div className="error-message text-red-500 mt-4">{error}</div>
				)}
				{success && (
					<div className="success-message text-green-500 mt-4">{success}</div>
				)}
			</div>
		</Layout>
	);
};

export default Invite;
