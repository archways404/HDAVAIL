import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

function CalendarViewWeek({ currentDate, calendars, initialEvents }) {
	const darkTheme = {
		common: {
			backgroundColor: '#1e1e2f',
			dayName: {
				color: '#ffffff',
			},
			border: '1px solid #3a3a4d',
		},
		week: {
			backgroundColor: '#1e1e2f',
			dayName: {
				backgroundColor: '#2a2a3d',
				borderBottom: '1px solid #444',
				color: '#ffffff',
			},
			timeGrid: {
				backgroundColor: '#1e1e2f',
				borderRight: '1px solid #3a3a4d',
			},
			timeColumn: {
				backgroundColor: '#1e1e2f',
				color: '#ffffff',
			},
			currentTimeIndicator: {
				backgroundColor: '#ff4d4d',
			},
			nowIndicatorLabel: {
				color: '#ff4d4d',
			},
		},
	};

	const handleCreateEvent = (event) => {
		console.log('New event created:', event);
		alert(`New event created: ${event.title}`);
	};

	const handleUpdateEvent = ({ event, changes }) => {
		console.log('Event updated:', event);
		alert(`Event "${event.title}" updated.`);
	};

	const handleDeleteEvent = (event) => {
		console.log('Event deleted:', event);
		alert(`Event "${event.title}" deleted.`);
	};

	return (
		<Calendar
			height="900px"
			view="week"
			date={currentDate}
			week={{
				startDayOfWeek: 1,
				hourStart: 8,
				hourEnd: 20,
				narrowWeekend: true,
				eventView: ['time'],
				taskView: false,
				useFormPopup: true,
				useDetailPopup: true,
				isReadOnly: false,
			}}
			theme={darkTheme} // Custom dark theme applied
			useCreationPopup={true}
			useDetailPopup={true}
			calendars={calendars}
			events={initialEvents}
			onBeforeCreateEvent={handleCreateEvent}
			onBeforeUpdateEvent={handleUpdateEvent}
			onBeforeDeleteEvent={handleDeleteEvent}
		/>
	);
}

export default CalendarViewWeek;
