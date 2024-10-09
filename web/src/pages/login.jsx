import { useState, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import Layout from '../components/Layout';
import DisplayStatus from '../components/DisplayStatus';
import { AuthContext } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const navigate = useNavigate();
	const { checkAuth } = useContext(AuthContext);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!username || !password) {
			setError('Please fill in all fields.');
			return;
		}

		setIsLoggingIn(true);

		try {
			// Load the fingerprintjs agent
			const fp = await FingerprintJS.load();
			// Get the visitor identifier
			const result = await fp.get();
			const deviceId = result.visitorId; // This is the unique identifier for the device

			const response = await fetch(import.meta.env.VITE_LOGIN, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					username,
					password,
					deviceId,
				}),
			});

			if (!response.ok) {
				throw new Error('Invalid username or password');
			}

			await checkAuth();

			setError('');

			navigate('/welcome');
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoggingIn(false);
		}
	};

	if (isLoggingIn) {
		return (
			<Layout>
				<LoadingScreen />
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="absolute bottom-4 right-4">
				<DisplayStatus />
			</div>
			<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
				<div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
					<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
						Login to Your Account
					</h2>

					{error && <p className="text-red-500 text-sm text-center">{error}</p>}

					<form
						onSubmit={handleSubmit}
						className="space-y-4">
						<div>
							<Label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								Username
							</Label>
							<Input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
								placeholder="Enter your username"
								required
							/>
						</div>

						<div>
							<Label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-200">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
								placeholder="Enter your password"
								required
							/>
						</div>

						<Button
							type="submit"
							disabled={isLoggingIn}
							className={`w-full px-4 py-2 mt-4 text-white rounded-md transition ${
								isLoggingIn
									? 'bg-green-300 cursor-not-allowed'
									: 'bg-green-500 hover:bg-green-600'
							}`}>
							{isLoggingIn ? 'Logging in...' : 'Login'}
						</Button>
					</form>

					<p className="text-sm text-center text-gray-600 dark:text-gray-400">
						Don't know your password?{' '}
						<Link
							to="/forgotpass"
							className="text-green-500 hover:underline">
							Reset it here
						</Link>
					</p>
				</div>
			</div>
		</Layout>
	);
}

export default Login;
