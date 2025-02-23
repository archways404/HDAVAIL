import React from 'react';
import { Mosaic } from 'react-loading-indicators';

const rainbowColors = [
	'#FF0000', // Red
	'#00FF00', // Green
	'#0000FF', // Blue
];

const LoadingScreen = () => (
	<div className="flex flex-col items-center justify-center min-h-screen">
		<Mosaic
			color={rainbowColors}
			size="large"
			duration={1000}
		/>
		<p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading...</p>
	</div>
);

export default LoadingScreen;
