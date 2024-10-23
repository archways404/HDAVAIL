function startRequest(request) {
	request.startTime = Date.now();
	console.log(`Request started: ${request.method} ${request.url}`);
}

function endRequest(request) {
	const requestTime = Date.now() - request.startTime;
	console.log('Request processing time:', requestTime, 'ms');
	request.processingTime = requestTime; // Store for further calculation if needed
	return requestTime;
}

function fetchDataStart(request) {
	request.dbStartTime = Date.now(); // Start timing the DB request
	console.log('Fetching data from database...');
}

function fetchDataEnd(request) {
	const fetchDataTime = Date.now() - request.dbStartTime;
	console.log('Data fetching time:', fetchDataTime, 'ms');
	request.dbFetchTime = fetchDataTime; // Store the time it took to fetch data
}

function calculateRequest(request) {
	const totalResponseTime = request.sendTime - request.startTime;
	const dbFetchTime = request.dbFetchTime;
	const processingTime = request.processingTime - request.dbFetchTime;

	console.log('Total response time:', totalResponseTime, 'ms');
	console.log('Request processing time:', processingTime, 'ms');
	console.log('Data fetching time:', dbFetchTime, 'ms');
	console.log(
		'Time spent sending response:',
		totalResponseTime - processingTime,
		'ms'
	);

	return {
		totalResponseTime,
		processingTime,
		dbFetchTime,
	};
}

module.exports = {
	startRequest,
	endRequest,
	fetchDataStart,
	fetchDataEnd,
	calculateRequest,
};
