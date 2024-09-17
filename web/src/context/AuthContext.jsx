import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const checkAuth = async () => {
		setLoading(true);
		try {
			const response = await axios.get(import.meta.env.VITE_AUTHENTICATED, {
				withCredentials: true,
			});

			if (response.data && response.data.user) {
				setUser(response.data.user);
			} else {
				setUser(null);
			}
		} catch (error) {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, setUser, checkAuth }}>
			{children}
		</AuthContext.Provider>
	);
}
