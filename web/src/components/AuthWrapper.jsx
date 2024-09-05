import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthWrapper = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [authenticated, setAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await axios.get(import.meta.env.VITE_AUTHENTICATED, {
					withCredentials: true,
				});

				if (response.data && response.data.user) {
					setUser(response.data.user);
					setAuthenticated(true);
				} else {
					setAuthenticated(false);
				}
			} catch (error) {
				setAuthenticated(false);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!authenticated) {
		navigate('/login');
		return null;
	}

	return React.cloneElement(children, { user });
};

export default AuthWrapper;
