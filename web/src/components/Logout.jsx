import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Logout() {
	const navigate = useNavigate();

	useEffect(() => {
		const logoutUser = async () => {
			try {
				// Make a request to the backend to clear the cookie
				await axios.get(import.meta.env.VITE_LOGOUT, {
					withCredentials: true, // Ensures that cookies are included in the request
				});

				// Optionally, clear any client-side user state
				// (e.g., remove user data from context or localStorage if needed)
				// localStorage.removeItem('user');

				// Redirect to the login page
				navigate('/');
			} catch (error) {
				console.error('Error logging out:', error);
			}
		};

		logoutUser();
	}, [navigate]);

	return <div>Logging you out...</div>;
}

export default Logout;
