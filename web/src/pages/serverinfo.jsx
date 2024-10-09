import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from '../components/Layout';

const ServerInfo = () => {
	const [serverData, setServerData] = useState(null);

	// Fetch detailed metrics from the backend
	const fetchServerData = async () => {
		try {
			const response = await fetch(import.meta.env.VITE_DETAILED_STATUS);
			const data = await response.json();
			setServerData(data);
		} catch (error) {
			console.error('Failed to fetch server metrics:', error);
		}
	};

	useEffect(() => {
		fetchServerData(); // Initial fetch
		const interval = setInterval(fetchServerData, 5000); // Fetch every 5 seconds
		return () => clearInterval(interval); // Cleanup on unmount
	}, []);

	if (!serverData) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-lg">Loading server data...</div>
			</div>
		);
	}

	// Line chart for system load averages
	const loadAvgData = {
		labels: ['1 min', '5 min', '15 min'],
		datasets: [
			{
				label: 'System Load (%)',
				data: [
					parseFloat(serverData.systemLoad['1min']),
					parseFloat(serverData.systemLoad['5min']),
					parseFloat(serverData.systemLoad['15min']),
				],
				backgroundColor: 'rgba(75,192,192,0.2)',
				borderColor: 'rgba(75,192,192,1)',
				borderWidth: 2,
				pointBackgroundColor: 'rgba(75,192,192,1)',
				pointBorderColor: '#fff',
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: 'rgba(75,192,192,1)',
				fill: true,
				tension: 0.4, // Smooth the lines
			},
		],
	};

	const loadAvgOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				labels: {
					font: {
						size: 14,
					},
				},
			},
			tooltip: {
				mode: 'index',
				intersect: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Load Percentage',
					font: {
						size: 16,
					},
				},
				grid: {
					display: true,
					color: 'rgba(200,200,200,0.2)',
				},
			},
			x: {
				title: {
					display: true,
					text: 'Time Period',
					font: {
						size: 16,
					},
				},
				grid: {
					display: false,
				},
			},
		},
	};

	// Bar chart for memory usage
	const memoryData = {
		labels: [
			'Total Memory',
			'Free Memory',
			'Used Memory',
			'RSS',
			'Heap Total',
			'Heap Used',
		],
		datasets: [
			{
				label: 'Memory (MB)',
				data: [
					parseFloat(serverData.memory.totalMemory),
					parseFloat(serverData.memory.freeMemory),
					parseFloat(serverData.memory.usedMemory),
					parseFloat(serverData.memory.rss),
					parseFloat(serverData.memory.heapTotal),
					parseFloat(serverData.memory.heapUsed),
				],
				backgroundColor: [
					'rgba(255, 99, 132, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(255, 206, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(153, 102, 255, 0.7)',
					'rgba(255, 159, 64, 0.7)',
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
				],
				borderWidth: 2,
			},
		],
	};

	const memoryOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				labels: {
					font: {
						size: 14,
					},
				},
			},
			tooltip: {
				mode: 'index',
				intersect: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Memory (MB)',
					font: {
						size: 16,
					},
				},
				grid: {
					display: true,
					color: 'rgba(200,200,200,0.2)',
				},
			},
			x: {
				title: {
					display: true,
					text: 'Memory Type',
					font: {
						size: 16,
					},
				},
				grid: {
					display: false,
				},
			},
		},
	};

	return (
		<Layout>
			<div className="server-info flex flex-col items-center w-full min-h-screen p-4">
				<h1 className="text-3xl font-bold mb-4">Server Status</h1>

				<div className="status-section p-6 shadow-md rounded-md w-full max-w-4xl">
					<h2 className="text-xl font-semibold mb-2">
						Total Requests: {serverData.totalRequests}
					</h2>
					<h3 className="text-lg mb-4">
						In-Flight Requests: {serverData.inFlightRequests}
					</h3>

					<div className="average-time-info mb-6">
						<h4 className="text-lg font-semibold mb-2">
							Average Request Time: {serverData.averageRequestTime}
						</h4>
					</div>

					{/* Line chart for System Load */}
					<div className="load-info mb-6 w-full">
						<h4 className="text-lg font-semibold mb-2">System Load Average</h4>
						<div className="w-full max-w-lg">
							<Line
								data={loadAvgData}
								options={loadAvgOptions}
							/>
						</div>
					</div>

					{/* Bar chart for Memory Usage */}
					<div className="memory-info mb-6 w-full">
						<h4 className="text-lg font-semibold mb-2">Memory Usage</h4>
						<div className="w-full max-w-lg">
							<Bar
								data={memoryData}
								options={memoryOptions}
							/>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default ServerInfo;
