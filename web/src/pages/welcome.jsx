// Welcome.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const Welcome = () => {
	const { user } = useContext(AuthContext);

	if (!user) {
		
		return null;
	}

	return (
		<Layout>
			<div className="welcome-container">
				<h1>Welcome, {user.username}!</h1>
				<p>Your UUID: {user.uuid}</p>
				<p>Your type: {user.type}</p>
			</div>
		</Layout>
	);
};

export default Welcome;
