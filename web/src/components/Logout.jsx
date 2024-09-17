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
				await axios.get(import.meta.env.VITE_LOGOUT, {
					withCredentials: true,
				});

				setUser(null);

				navigate('/login');
			} catch (error) {
				console.error('Error logging out:', error);

				setUser(null);
				navigate('/login');
			} finally {
				setIsLoggingOut(false);
			}
		};

		logoutUser();
	}, [navigate, setUser]);

	if (isLoggingOut) {
		return <LoadingScreen />;
	}

	return null;
}

export default Logout;
