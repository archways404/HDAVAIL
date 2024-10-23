const requestLogs = [];

function logRequestData(requestData) {
	requestLogs.push(requestData);
}

function getAllRequestLogs() {
	return requestLogs;
}

function startRequest(request) {
	request.startTime = Date.now();
	request.method = request.method;
	request.endpoint = request.url;
	console.log(`Request started: ${request.method} ${request.url}`);
}

function endRequest(request) {
	const requestTime = Date.now() - request.startTime;
	request.processingTime = requestTime;
	return requestTime;
}

function fetchDataStart(request) {
	request.dbStartTime = Date.now();
}

function fetchDataEnd(request) {
	const fetchDataTime = Date.now() - request.dbStartTime;
	request.dbFetchTime = fetchDataTime;
}

function calculateRequest(request) {

	if (!request.dbFetchTime) {
		const totalResponseTime = request.sendTime - request.startTime;
		const processingTime = request.processingTime;

		console.log('Request processing time:', processingTime, 'ms');
		console.log('Total response time:', totalResponseTime, 'ms');

		const requestData = {
			method: request.method,
			endpoint: request.endpoint,
			totalResponseTime,
			processingTime,
			timestamp: new Date(),
		};

		logRequestData(requestData);

		return requestData;
	} else {
		const totalResponseTime = request.sendTime - request.startTime;
		const dbFetchTime = request.dbFetchTime;
		const processingTime = request.processingTime - request.dbFetchTime;

		console.log('Data fetching time:', dbFetchTime, 'ms');
		console.log('Request processing time:', processingTime, 'ms');
		console.log('Total response time:', totalResponseTime, 'ms');

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
}

module.exports = {
	startRequest,
	endRequest,
	fetchDataStart,
	fetchDataEnd,
	calculateRequest,
	logRequestData,
	getAllRequestLogs,
};
