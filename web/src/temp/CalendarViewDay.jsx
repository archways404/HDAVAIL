import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

function CalendarViewDay({
	currentDate,
	calendars,
	initialEvents,
	onAfterRenderEvent,
}) {
	return (
		<Calendar
			height="900px"
			view="day"
			date={currentDate}
			day={{
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
			useCreationPopup={true}
			useDetailPopup={true}
			calendars={calendars}
			events={initialEvents}
			onAfterRenderEvent={onAfterRenderEvent}
		/>
	);
}

export default CalendarViewDay;
