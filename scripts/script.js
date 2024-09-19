const axios = require('axios');
const ical = require('ical.js');
const fs = require('fs');
const path = require('path');

// Date
const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

// Construct the URL
//const viewLink = `https://schema.mau.se/setup/jsp/Schema.jsp?sprak=SV&sokMedAND=true&intervallAntal=1&startDatum=${formattedDate}&intervallTyp=a&resurser=s.HDledig`;

const fileLink = `https://schema.mau.se/setup/jsp/SchemaICAL.ics?sprak=SV&sokMedAND=true&intervallAntal=1&startDatum=${formattedDate}&intervallTyp=a&resurser=s.HDledig`;

const headers = {
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
};

// Download the .ics file
axios
	.get(fileLink, { headers, responseType: 'arraybuffer' })
	.then((response) => {
		if (response.status === 200 && response.data) {
			const filename = path.join(__dirname, `files/${formattedDate}.ics`);
			fs.writeFileSync(filename, response.data);
			console.log(`File saved as ${filename}`);

			// After saving, parse the .ics file
			const icsData = fs.readFileSync(filename, 'utf-8');
			const filteredEvents = parseIcsFile(icsData);

			// Save filtered events as JSON
			const outputFilePath = path.join(
				__dirname,
				`files/${formattedDate}_filtered.json`
			);
			saveEventsToJson(filteredEvents, outputFilePath);
			console.log(`Filtered events saved to ${outputFilePath}`);
		} else {
			console.log(
				`Failed to download file or file is empty. Status code: ${response.status}`
			);
		}
	})
	.catch((error) => {
		console.error(`Error downloading .ics file: ${error}`);
	});

// Function to parse an ICS file and extract event details
function parseIcsFile(data) {
	const events = [];
	const jcalData = ical.parse(data); // Parse the ICS file using ical.js
	const calendar = new ical.Component(jcalData);

	const vevents = calendar.getAllSubcomponents('vevent');
	vevents.forEach((component) => {
		const event = {};
		event.uid = component.getFirstPropertyValue('uid');
		const summary = component.getFirstPropertyValue('summary');

		// Extract 'Moment' from summary
		const momentMatch = /Moment: (\w+)/.exec(summary);
		event.moment = momentMatch ? momentMatch[1] : 'N/A';
		event.location = component.getFirstPropertyValue('location');

		// Separate date and time for start and end
		const startDateTime = new ical.Time(
			component.getFirstPropertyValue('dtstart')
		);
		const endDateTime = new ical.Time(component.getFirstPropertyValue('dtend'));
		event.date = startDateTime.toJSDate().toISOString().split('T')[0]; // YYYY-MM-DD
		event.start_time = startDateTime.toJSDate().toISOString().split('T')[1]; // HH:MM:SS
		event.end_time = endDateTime.toJSDate().toISOString().split('T')[1]; // HH:MM:SS

		// Calculate duration in hours
		const durationInMs = endDateTime.toJSDate() - startDateTime.toJSDate();
		event.hours = (durationInMs / 1000 / 3600).toFixed(1);

		// Created and last modified
		const createdDateTime = new ical.Time(
			component.getFirstPropertyValue('created')
		);
		const lastModifiedDateTime = new ical.Time(
			component.getFirstPropertyValue('last-modified')
		);
		event.created_date = createdDateTime.toJSDate().toISOString().split('T')[0];
		event.created_time = createdDateTime.toJSDate().toISOString().split('T')[1];
		event.last_modified_date = lastModifiedDateTime
			.toJSDate()
			.toISOString()
			.split('T')[0];
		event.last_modified_time = lastModifiedDateTime
			.toJSDate()
			.toISOString()
			.split('T')[1];

		// Format UID by removing the prefix
		const uidMatch = /BokningsId_(\d+_\d+)/.exec(event.uid);
		event.uid = uidMatch ? uidMatch[1] : event.uid;

		// Filter for "Moment: ledig"
		if (event.moment.toLowerCase() === 'ledig') {
			events.push(event);
		}
	});

	return events;
}

// Function to save events as JSON to a new file
function saveEventsToJson(events, filePath) {
	fs.writeFileSync(filePath, JSON.stringify(events, null, 2), 'utf-8');
}
