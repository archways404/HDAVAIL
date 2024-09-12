import React from 'react';

import Layout from '../components/Layout';

const Welcome = ({ user }) => {
	console.log(user);
	return (
		<Layout user={user}>
			<div className="welcome-container">
				<h1>Welcome, {user.username}!</h1>
				<p>Your UUID: {user.uuid}</p>
				<p>Your type: {user.type}</p>
			</div>
		</Layout>
	);
};

export default Welcome;
