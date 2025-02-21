//! OUTDATED - NEEDS TO BE UPDATED

const requestLogs = [];

// Log request data into the array
function logRequestData(requestData) {
	requestLogs.push(requestData);
}

// Return all request logs
async function getAllRequestLogs() {
	return requestLogs;
}

// Sort all request logs by method and endpoint
async function sortAllRequestLogs(allRequests) {
	const groupedData = {};

	allRequests.forEach((req) => {
		const key = `${req.method} ${req.endpoint}`;

		if (!groupedData[key]) {
			groupedData[key] = {
				requestCount: 0,
				totalResponseTime: [],
				processingTime: [],
				dbFetchTime: [],
				requests: [],
			};
		}

		groupedData[key].requestCount += 1;
		groupedData[key].totalResponseTime.push(req.totalResponseTime);
		groupedData[key].processingTime.push(req.processingTime);
		if (req.dbFetchTime) groupedData[key].dbFetchTime.push(req.dbFetchTime);

		groupedData[key].requests.push({
			totalResponseTime: req.totalResponseTime,
			processingTime: req.processingTime,
			dbFetchTime: req.dbFetchTime,
			timestamp: req.timestamp,
		});
	});

	// Calculate min, max, and average for each group
	Object.keys(groupedData).forEach((key) => {
		const group = groupedData[key];

		const calcStats = (arr) => ({
			min: Math.min(...arr),
			max: Math.max(...arr),
			average: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2),
		});

		group.totalResponseTime = calcStats(group.totalResponseTime);
		group.processingTime = calcStats(group.processingTime);
		group.dbFetchTime = group.dbFetchTime.length
			? calcStats(group.dbFetchTime)
			: null;
	});

	return groupedData;
}

// Start request logging
function startRequest(request) {
	request.startTime = Date.now();
	request.method = request.method;
	request.endpoint = request.url;
	console.log(`Request started: ${request.method} ${request.url}`);
}

// End request and calculate processing time
function endRequest(request) {
	const requestTime = Date.now() - request.startTime;
	request.processingTime = requestTime;
	console.log(`Request processed in ${requestTime} ms`);
	return requestTime;
}

// Mark the start of database fetching
function fetchDataStart(request) {
	request.dbStartTime = Date.now();
}

// Mark the end of database fetching and calculate fetch time
function fetchDataEnd(request) {
	const fetchDataTime = Date.now() - request.dbStartTime;
	request.dbFetchTime = fetchDataTime;
	console.log(`Data fetched in ${fetchDataTime} ms`);
}

// Calculate request timings and log request data
function calculateRequest(request) {
	request.sendTime = Date.now();

	const totalResponseTime = request.sendTime - request.startTime;
	const processingTime = request.processingTime;
	const dbFetchTime = request.dbFetchTime || null;

	console.log(`Total response time: ${totalResponseTime} ms`);
	if (dbFetchTime) {
		console.log(`Data fetch time: ${dbFetchTime} ms`);
	}

	const requestData = {
		method: request.method,
		endpoint: request.endpoint,
		totalResponseTime,
		processingTime,
		dbFetchTime,
		timestamp: new Date(),
	};

	logRequestData(requestData);

	return requestData;
}

module.exports = {
	startRequest,
	endRequest,
	fetchDataStart,
	fetchDataEnd,
	calculateRequest,
	logRequestData,
	getAllRequestLogs,
	sortAllRequestLogs,
};
