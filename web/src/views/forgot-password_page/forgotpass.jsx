import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import Layout from '../../components/Layout';

function ForgotPass() {
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email) {
			setError('Please enter your email.');
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

			setError('');
			setMessage('Password reset link has been sent to your email.');
		} catch (error) {
			setError(error.message);
		}
	};

	return (
		<Layout>
			<div className="flex items-center justify-center max-h-screen">
				<div className="w-full max-w-md p-8 space-y-6 rounded-lg">
					<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
						Reset Your Password
					</h2>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}
					{message && (
						<p className="text-green-500 text-sm text-center">{message}</p>
					)}

					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<Label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:text-white"
								placeholder="Enter your email"
								required
							/>
						</div>

						<Button
							type="submit"
							className="w-full px-4 py-2 mt-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
							Send Reset Link
						</Button>
					</form>

					<p className="text-sm text-center text-gray-600 dark:text-gray-400">
						Back to{' '}
						<Link
							to="/login"
							className="text-green-500 hover:underline">
							Login
						</Link>
					</p>
				</div>
			</div>
		</Layout>
	);
}

export default ForgotPass;
