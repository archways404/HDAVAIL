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

	// Fetch the user data based on UUID
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(
					import.meta.env.VITE_BASE_ADDR + '/get-user?uuid=' + uuid
				);
				if (!response.ok) {
					throw new Error('Failed to fetch user details');
				}
				const data = await response.json();
				if (data.length > 0) {
					setUser(data[0]); // Set the first user object from the array
					setEmail(data[0].email); // Set the email from user data
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
				<LoadingScreen /> // Render the LoadingScreen component while loading
			) : (
				<div className="user-detail p-8 max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
					{error ? (
						<p className="text-center text-red-500 font-semibold">{error}</p>
					) : user ? (
						<div className="text-center">
							{/* User Avatar */}
							<div className="mx-auto w-24 h-24 mb-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
								<UserIcon className="w-16 h-16 text-gray-800 dark:text-gray-200" />
							</div>

							{/* User Name */}
							<h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
								{user.first_name} {user.last_name}
							</h2>

							{/* User UUID */}
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
								<span className="font-semibold">UUID:</span> {user.uuid}
							</p>

							{/* User Details */}
							<div className="space-y-4 text-left">
								<div className="flex items-center space-x-2">
									<CheckBadgeIcon className="w-5 h-5 text-green-500" />
									<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
										Username:{' '}
										<span className="font-normal">{user.username}</span>
									</p>
								</div>

								<div className="flex items-center space-x-2">
									<EnvelopeIcon className="w-5 h-5 text-blue-500" />
									<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
										Email: <span className="font-normal">{user.email}</span>
									</p>
								</div>

								<div className="flex items-center space-x-2">
									<CheckBadgeIcon className="w-5 h-5 text-yellow-500" />
									<p className="text-lg font-medium text-gray-800 dark:text-gray-300">
										Role:{' '}
										<span className="font-normal capitalize">{user.type}</span>
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<Button onClick={handleResetPassword}>Reset Password</Button>
								</div>
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
