import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from '../components/Layout';

const ServerInfo = () => {
	const [serverData, setServerData] = useState(null);
	const [loadAvgData, setLoadAvgData] = useState({
		labels: ['1min', '5min', '15min'],
		datasets: [
			{
				label: 'Load Average',
				data: [0, 0, 0],
				backgroundColor: 'rgba(75,192,192,0.2)',
				borderColor: 'rgba(75,192,192,1)',
				borderWidth: 1,
			},
		],
	});

	const fetchServerData = async () => {
		try {
			const response = await fetch(import.meta.env.VITE_DETAILED_STATUS);
			const data = await response.json();
			setServerData(data);
			setLoadAvgData({
				...loadAvgData,
				datasets: [
					{
						...loadAvgData.datasets[0],
						data: [
							data.loadAverage['1min'],
							data.loadAverage['5min'],
							data.loadAverage['15min'],
						],
					},
				],
			});
		} catch (error) {
			console.error('Failed to fetch server data:', error);
		}
	};

	useEffect(() => {
		fetchServerData();
		const interval = setInterval(fetchServerData, 5000);
		return () => clearInterval(interval);
	}, []);

	if (!serverData) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-lg">Loading server data...</div>
			</div>
		);
	}

	return (
		<Layout>
			<div className="server-info flex flex-col items-center w-full min-h-screen p-4">
				<h1 className="text-3xl font-bold mb-4">Server Status</h1>

				<div className="status-section p-6 shadow-md rounded-md w-full max-w-4xl">
					<h2 className="text-xl font-semibold mb-2">
						Status: <span className="text-green-600">{serverData.status}</span>
					</h2>
					<h3 className="text-lg mb-4">Uptime: {serverData.uptime}</h3>

					<div className="memory-info mb-6">
						<h4 className="text-lg font-semibold mb-2">Memory Usage</h4>
						<ul className="list-disc list-inside pl-4">
							<li>RSS: {serverData.memory.rss}</li>
							<li>Heap Total: {serverData.memory.heapTotal}</li>
							<li>Heap Used: {serverData.memory.heapUsed}</li>
							<li>External: {serverData.memory.external}</li>
						</ul>
					</div>

					<div className="load-info">
						<h4 className="text-lg font-semibold mb-2">Load Average</h4>
						<div className="w-full max-w-lg">
							<Line data={loadAvgData} />
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ServerInfo;
