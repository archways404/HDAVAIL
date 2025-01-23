import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	EnvelopeIcon,
	UserIcon,
	CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingScreen from '../components/LoadingScreen';
import { useToast } from '@/hooks/use-toast';

const UserDetail = () => {
	const { uuid } = useParams();
	const [user, setUser] = useState(null);
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/get-user?uuid=${uuid}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch user details');
				}
				const data = await response.json();

				if (data) {
					setUser(data); // Set the entire response object as `user`
					setEmail(data.userDetails.email); // Set email for reset password
				} else {
					setError('User not found');
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [uuid]);

	const handleResetPassword = async (e) => {
		e.preventDefault();

		if (!email) {
			toast({
				title: 'Error',
				description: 'Error: Email not found.',
				variant: 'destructive',
			});
			return;
		}

		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/forgotPassword',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						email,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send reset link. Please check your email.');
			}

			toast({
				title: 'Success',
				description: 'Password reset link has been sent to your email.',
				variant: 'success',
				duration: 3000, // Toast duration in milliseconds
			});

			setError('');
		} catch (error) {
			toast({
				title: 'Error',
				description: error.message,
				variant: 'destructive',
			});
			setError(error.message);
		}
	};

	return (
		<Layout>
			{loading ? (
				<LoadingScreen />
			) : (
				<div className="user-detail p-8 max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
					{error ? (
						<p className="text-center text-red-500 font-semibold">{error}</p>
					) : user ? (
						<div className="space-y-8">
							{/* User Details Section */}
							<div className="text-center">
								<div className="mx-auto w-24 h-24 mb-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
									<UserIcon className="w-16 h-16 text-gray-800 dark:text-gray-200" />
								</div>
								<h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
									{user.userDetails.first_name} {user.userDetails.last_name}
								</h2>
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
									<span className="font-semibold">UUID:</span>{' '}
									{user.userDetails.user_id}
								</p>
								<div className="space-y-4 text-left">
									<div className="flex items-center space-x-2">
										<EnvelopeIcon className="w-5 h-5 text-blue-500" />
										<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
											Email:{' '}
											<span className="font-normal">
												{user.userDetails.email}
											</span>
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<CheckBadgeIcon className="w-5 h-5 text-yellow-500" />
										<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
											Role:{' '}
											<span className="font-normal capitalize">
												{user.userDetails.role}
											</span>
										</p>
									</div>
								</div>
								<Button
									onClick={handleResetPassword}
									className="mt-4">
									Reset Password
								</Button>
							</div>

							{/* Lockout Details Section */}
							<div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
									Account Lockout Details
								</h3>
								<ul className="space-y-2">
									<li>
										<span className="font-medium">Failed Attempts:</span>{' '}
										{user.lockoutDetails?.failed_attempts || 0}
									</li>
									<li>
										<span className="font-medium">Last Failed IP:</span>{' '}
										{user.lockoutDetails?.last_failed_ip || 'N/A'}
									</li>
									<li>
										<span className="font-medium">Locked:</span>{' '}
										{user.lockoutDetails?.locked ? 'Yes' : 'No'}
									</li>
									<li>
										<span className="font-medium">Unlock Time:</span>{' '}
										{user.lockoutDetails?.unlock_time || 'N/A'}
									</li>
									<li>
										<span className="font-medium">Last Failed Time:</span>{' '}
										{user.lockoutDetails?.last_failed_time
											? new Date(
													user.lockoutDetails.last_failed_time
											  ).toLocaleString()
											: 'N/A'}
									</li>
								</ul>
							</div>

							{/* Schedule Groups Section */}
							<div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
									Schedule Groups
								</h3>
								<ul className="space-y-2">
									{user.scheduleGroups?.length > 0 ? (
										user.scheduleGroups.map((group) => (
											<li
												key={group.group_id}
												className="flex justify-between">
												<span>{group.name}</span>
												<span className="text-gray-500 dark:text-gray-400 text-sm">
													{group.group_id}
												</span>
											</li>
										))
									) : (
										<p>No groups assigned</p>
									)}
								</ul>
							</div>
						</div>
					) : (
						<p className="text-center text-lg text-gray-600 dark:text-gray-300">
							User not found.
						</p>
					)}
				</div>
			)}
		</Layout>
	);

};

export default UserDetail;
