import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import LoadingScreen from './LoadingScreen';

const AuthWrapper = ({ children, allowedUserRoles }) => {
	const { user, loading } = useContext(AuthContext);

	if (loading) {
		return <LoadingScreen />;
	}

	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	if (allowedUserRoles && !allowedUserRoles.includes(user.role)) {
		return (
			<Navigate
				to="/welcome"
				replace
			/>
		);
	}

	return children;
};

export default AuthWrapper;
