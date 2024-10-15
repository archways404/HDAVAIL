import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function Logout() {
	const navigate = useNavigate();
	const { setUser } = useContext(AuthContext);
	const [isLoggingOut, setIsLoggingOut] = useState(true);

	useEffect(() => {
		const logoutUser = async () => {
			try {
				// Correct the axios post request
				await axios.post(
					import.meta.env.VITE_BASE_ADDR + '/logout',
					{},
					{
						withCredentials: true, // Ensure cookies are sent
					}
				);

				// Clear user context
				await setUser(null);

				// Navigate to login after logout
				navigate('/login');
			} catch (error) {
				console.error('Error logging out:', error);

				// Clear user context and navigate to error page in case of failure
				setUser(null);
				navigate('/error');
			} finally {
				setIsLoggingOut(false);
			}
		};

		logoutUser();
	}, [navigate, setUser]);

	// Show a loading screen while logging out
	if (isLoggingOut) {
		return <LoadingScreen />;
	}

	return null;
}

export default Logout;
