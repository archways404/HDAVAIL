import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

function CalendarViewMonth({ currentDate, calendars, initialEvents }) {
	const darkTheme = {
		common: {
			backgroundColor: '#1e1e2f',
			holiday: { color: '#ff6b6b' }, // Holiday text color
			border: '1px solid #3a3a4d',
		},
		month: {
			backgroundColor: '#1e1e2f',
			dayName: {
				backgroundColor: '#2a2a3d',
				color: '#ffffff',
				borderBottom: '1px solid #444',
			},
			weekend: {
				backgroundColor: '#29293f',
				color: '#ffffff',
			},
			moreView: {
				backgroundColor: '#2e2e3f',
				border: '1px solid #3a3a4d',
			},
			gridCell: {
				holidayExceptThisMonth: {
					backgroundColor: '#1e1e2f',
					color: '#6b6b6b',
				},
				saturday: { backgroundColor: '#1f1f2e', color: '#cccccc' },
				sunday: { backgroundColor: '#2a2a3d', color: '#ff6b6b' },
				workweek: { backgroundColor: '#1e1e2f', color: '#ffffff' },
			},
			moreViewTitle: { color: '#ffffff' },
		},
	};

	const handleCreateEvent = (event) => {
		console.log('New event created:', event);
		alert(`New event created: ${event.title}`);
	};

	// Handle updating events (edit)
	const handleUpdateEvent = ({ event, changes }) => {
		console.log('Event updated:', event);
		console.log('Changes:', changes);
		alert(`Event "${event.title}" updated.`);
	};

	// Handle deleting events
	const handleDeleteEvent = (event) => {
		console.log('Event deleted:', event);
		alert(`Event "${event.title}" deleted.`);
	};

	return (
		<Calendar
			height="900px"
			view="month"
			date={currentDate} // Controlled date
			month={{
				startDayOfWeek: 1, // Monday as the first day of the week
				visibleWeeksCount: 4,
			}}
			//theme={darkTheme} // Apply custom dark theme
			calendars={calendars}
			events={initialEvents}
			isReadOnly={false}
			useFormPopup={true}
			useDetailPopup={true}
			onBeforeCreateEvent={handleCreateEvent} // Handle event creation
			onBeforeUpdateEvent={handleUpdateEvent} // Handle event updates (edit)
			onBeforeDeleteEvent={handleDeleteEvent} // Handle event deletion
		/>
	);
}

export default CalendarViewMonth;
