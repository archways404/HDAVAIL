import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from '../components/Layout';

// Utility function to parse Prometheus metrics
const parsePrometheusMetrics = (metrics) => {
	const result = {};
	const lines = metrics.split('\n');

	lines.forEach((line) => {
		if (line.startsWith('#') || line.trim() === '') {
			return; // Ignore comments and empty lines
		}

		const [key, value] = line.split(' ');
		if (key && value) {
			result[key] = parseFloat(value);
		}
	});

	return result;
};

// Helper function to assign color based on value thresholds
const getColor = (value, low, high) => {
	if (value <= low) return 'rgba(75, 192, 192, 0.7)'; // green
	if (value > low && value <= high) return 'rgba(255, 206, 86, 0.7)'; // orange
	return 'rgba(255, 99, 132, 0.7)'; // red
};

// Helper function to format values
const formatValue = (value, unit = '') => {
	return value ? `${value.toFixed(2)}${unit}` : '0';
};

const ServerInfo = () => {
	const [serverData, setServerData] = useState(null);

	// Fetch detailed metrics from the backend
	const fetchServerData = async () => {
		try {
			const response = await fetch(import.meta.env.VITE_BASE_ADDR + '/metrics');
			const textData = await response.text(); // Prometheus metrics are in plain text format
			const parsedData = parsePrometheusMetrics(textData); // Parse the data
			setServerData(parsedData); // Store parsed metrics in state
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

	// Memory Usage Data
	const memoryData = {
		labels: ['Resident Memory (MB)', 'Heap Used (MB)', 'Heap Total (MB)'],
		datasets: [
			{
				label: 'Memory Usage (MB)',
				data: [
					serverData['process_resident_memory_bytes'] / (1024 * 1024), // Convert bytes to MB
					serverData['nodejs_heap_size_used_bytes'] / (1024 * 1024),
					serverData['nodejs_heap_size_total_bytes'] / (1024 * 1024),
				],
				backgroundColor: [
					getColor(
						serverData['process_resident_memory_bytes'] / (1024 * 1024),
						100,
						500
					), // Adjust based on actual thresholds
					getColor(
						serverData['nodejs_heap_size_used_bytes'] / (1024 * 1024),
						50,
						200
					),
					getColor(
						serverData['nodejs_heap_size_total_bytes'] / (1024 * 1024),
						100,
						300
					),
				],
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
				callbacks: {
					label: (tooltipItem) => formatValue(tooltipItem.raw, ' MB'),
				},
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

	// CPU Usage Data
	const cpuData = {
		labels: ['User CPU Time (s)', 'System CPU Time (s)', 'Total CPU Time (s)'],
		datasets: [
			{
				label: 'CPU Time (s)',
				data: [
					serverData['process_cpu_user_seconds_total'],
					serverData['process_cpu_system_seconds_total'],
					serverData['process_cpu_seconds_total'],
				],
				backgroundColor: [
					getColor(serverData['process_cpu_user_seconds_total'], 0.5, 1),
					getColor(serverData['process_cpu_system_seconds_total'], 0.5, 1),
					getColor(serverData['process_cpu_seconds_total'], 1, 2),
				],
			},
		],
	};

	const cpuOptions = {
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
				callbacks: {
					label: (tooltipItem) => formatValue(tooltipItem.raw, ' s'),
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'CPU Time (s)',
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
					text: 'CPU Metric',
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

	// Event Loop Lag Data (values in milliseconds for better readability)
	const eventLoopData = {
		labels: [
			'Min (ms)',
			'Max (ms)',
			'Mean (ms)',
			'P50 (ms)',
			'P90 (ms)',
			'P99 (ms)',
		],
		datasets: [
			{
				label: 'Event Loop Lag (ms)',
				data: [
					serverData['nodejs_eventloop_lag_min_seconds'] * 1000, // Convert seconds to ms
					serverData['nodejs_eventloop_lag_max_seconds'] * 1000,
					serverData['nodejs_eventloop_lag_mean_seconds'] * 1000,
					serverData['nodejs_eventloop_lag_p50_seconds'] * 1000,
					serverData['nodejs_eventloop_lag_p90_seconds'] * 1000,
					serverData['nodejs_eventloop_lag_p99_seconds'] * 1000,
				],
				backgroundColor: getColor(
					serverData['nodejs_eventloop_lag_mean_seconds'] * 1000,
					10,
					50
				),
			},
		],
	};

	const eventLoopOptions = {
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
				callbacks: {
					label: (tooltipItem) => formatValue(tooltipItem.raw, ' ms'),
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Lag (ms)',
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
					text: 'Lag Percentile',
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

	// HTTP Request Duration Data
	const requestDurationData = {
		labels: [
			'0.005s',
			'0.01s',
			'0.025s',
			'0.05s',
			'0.1s',
			'0.25s',
			'0.5s',
			'1s',
			'2.5s',
			'5s',
		],
		datasets: [
			{
				label: 'Request Duration (s)',
				data: [
					serverData[
						'http_request_duration_seconds_bucket{le="0.005",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="0.01",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="0.025",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="0.05",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="0.1",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="0.25",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="0.5",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="1",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="2.5",method="GET",route="/metrics",status_code="200"}'
					] || 0,
					serverData[
						'http_request_duration_seconds_bucket{le="5",method="GET",route="/metrics",status_code="200"}'
					] || 0,
				],
				backgroundColor: 'rgba(153, 102, 255, 0.7)',
			},
		],
	};

	const requestDurationOptions = {
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
				callbacks: {
					label: (tooltipItem) => formatValue(tooltipItem.raw, ' s'),
				},
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Request Count',
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
					text: 'Request Duration (s)',
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

				{/* Memory Usage Bar Chart */}
				<div className="memory-info mb-6 w-full max-w-lg">
					<h4 className="text-lg font-semibold mb-2">Memory Usage</h4>
					<Bar
						data={memoryData}
						options={memoryOptions}
					/>
				</div>

				{/* CPU Usage Bar Chart */}
				<div className="cpu-info mb-6 w-full max-w-lg">
					<h4 className="text-lg font-semibold mb-2">CPU Usage</h4>
					<Bar
						data={cpuData}
						options={cpuOptions}
					/>
				</div>

				{/* Event Loop Lag Bar Chart */}
				<div className="event-loop-info mb-6 w-full max-w-lg">
					<h4 className="text-lg font-semibold mb-2">Event Loop Lag</h4>
					<Bar
						data={eventLoopData}
						options={eventLoopOptions}
					/>
				</div>

				{/* Request Duration Bar Chart */}
				<div className="request-duration-info mb-6 w-full max-w-lg">
					<h4 className="text-lg font-semibold mb-2">Request Duration</h4>
					<Bar
						data={requestDurationData}
						options={requestDurationOptions}
					/>
				</div>
			</div>
		</Layout>
	);
};

export default ServerInfo;
