import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useState } from 'react';
import EventModal from './EventModal';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import svLocale from '@fullcalendar/core/locales/sv';

function CalendarView({ events, onEventSubmit, onDeleteEvent }) {
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

	function getCurrentTime() {
		const now = new Date();
		let hours = now.getHours();
		const minutes = now.getMinutes();

		// Round to closest hour
		if (minutes >= 30) {
			hours += 1; // Round up to the next hour if 30 minutes or more
		}

		// Handle 24-hour format wrap-around
		if (hours === 24) {
			hours = 0;
		}

		const formattedHours = String(hours).padStart(2, '0');
		return `${formattedHours}:00:00`; // Nearest full hour (e.g., 14:00:00)
	}

	// Handle creating new event
	const handleDateSelect = (selectInfo) => {
		setSelectedEvent({
			id: String(Date.now()), // Unique ID for new event
			start: selectInfo.startStr,
			end: selectInfo.endStr,
			allDay: selectInfo.allDay,
		});
		setModalOpen(true);
	};

	// Handle clicking on an existing event
	const handleEventClick = (clickInfo) => {
		setSelectedEvent({
			id: clickInfo.event.id,
			title: clickInfo.event.title,
			start: clickInfo.event.startStr,
			end: clickInfo.event.endStr,
			description: clickInfo.event.extendedProps?.description || '',
		});
		setModalOpen(true);
	};

	return (
		<div className="w-full h-[calc(100vh-200px)]">
			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
				initialView="dayGridMonth"
				editable={true}
				selectable={true}
				selectMirror={true}
				dayMaxEvents={true}
				events={events}
				select={handleDateSelect} // Opens modal to create new event
				eventClick={handleEventClick} // Opens modal to edit/delete event
				locale={enGbLocale}
				//locale={svLocale}
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
				}}
				views={{
					dayGridMonth: {
						firstDay: 1,
						titleFormat: { year: 'numeric', month: 'long' },
						dayHeaderFormat: { weekday: 'short' }, // Show short weekdays (Mon, Tue)
						weekNumbers: true,
					},
					timeGridWeek: {
						firstDay: 1,
						slotDuration: '00:30:00',
						slotLabelInterval: '01:00:00',
						slotMinTime: '06:00:00', // Start time: 8 AM
						slotMaxTime: '21:00:00', // End time: 8 PM
						allDaySlot: false, // Show "All Day" at the top
						expandRows: false,
						nowIndicator: true,
						scrollTime: getCurrentTime(), // Scroll to current time
					},
					timeGridDay: {
						firstDay: 1,
						slotDuration: '00:30:00', // 30-minute slots in day view
						slotMinTime: '06:00:00', // Start time: 6 AM
						slotMaxTime: '22:00:00', // End time: 10 PM
						allDaySlot: false, // Hide "All Day" in day view
						scrollTime: getCurrentTime(), // Scroll to current time
					},
					listWeek: {
						firstDay: 1,
						listDayFormat: false, // Remove the header for each day in list view
						listDaySideFormat: { weekday: 'short', day: 'numeric' }, // Short format for list view
						scrollTime: getCurrentTime(), // Scroll to current time
					},
				}}
			/>
			{/* Event Modal */}
			<EventModal
				isOpen={isModalOpen}
				event={selectedEvent}
				onClose={() => setModalOpen(false)}
				onSubmit={(event) => {
					onEventSubmit(event); // Create or update event
					setModalOpen(false);
				}}
				onDelete={() => {
					onDeleteEvent(selectedEvent.id); // Delete event
					setModalOpen(false);
				}}
			/>
		</div>
	);
}

export default CalendarView;
