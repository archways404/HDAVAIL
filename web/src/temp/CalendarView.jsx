import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useState } from 'react';
import EventModal from './EventModal'; // Import the modal component

function CalendarView({ events, onEventSubmit, onDeleteEvent }) {
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

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
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
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
