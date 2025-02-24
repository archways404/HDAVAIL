import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useState } from 'react';
import EventModal from './EventModal';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import svLocale from '@fullcalendar/core/locales/sv';
import {
	HoverCard,
	HoverCardTrigger,
	HoverCardContent,
} from '@/components/ui/hover-card';

function CalendarView({ events, onEventSubmit, onDeleteEvent }) {
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

	function getCurrentTime() {
		const now = new Date();
		let hours = now.getHours();
		const minutes = now.getMinutes();

		if (minutes >= 30) {
			hours += 1;
		}

		if (hours === 24) {
			hours = 0;
		}

		const formattedHours = String(hours).padStart(2, '0');
		return `${formattedHours}:00:00`;
	}

	// Handle creating new event
	const handleDateSelect = (selectInfo) => {
		setSelectedEvent({
			id: String(Date.now()),
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

	// Function to render custom event content with HoverCard
	const renderEventContent = (eventInfo) => {
		return (
			<HoverCard>
				<HoverCardTrigger className="cursor-pointer block p-1">
					<span className="text-sm font-medium text-gray-800 dark:text-gray-200">
						{eventInfo.event.title}
					</span>
				</HoverCardTrigger>
				<HoverCardContent className="p-4 border border-gray-300 bg-white shadow-md rounded-md dark:bg-gray-800">
					<p className="text-sm font-semibold">{eventInfo.event.title}</p>
					<p className="text-xs text-gray-500">
						{new Date(eventInfo.event.start).toLocaleString()} -{' '}
						{new Date(eventInfo.event.end).toLocaleString()}
					</p>
					<p className="text-xs text-gray-500">
						{eventInfo.event.extendedProps?.description || 'No description'}
					</p>
					{eventInfo.event.extendedProps?.assignedTo ? (
						<p className="text-xs text-green-500">
							Assigned to: {eventInfo.event.extendedProps.assignedUserFirstName}{' '}
							{eventInfo.event.extendedProps.assignedUserLastName}
						</p>
					) : (
						<p className="text-xs text-red-500">Unassigned</p>
					)}
				</HoverCardContent>
			</HoverCard>
		);
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
				select={handleDateSelect}
				eventClick={handleEventClick}
				locale={enGbLocale}
				eventContent={renderEventContent} // Render hover effect on events
				headerToolbar={{
					left: 'prev,next today',
					center: 'title',
					right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
				}}
				views={{
					dayGridMonth: {
						firstDay: 1,
						titleFormat: { year: 'numeric', month: 'long' },
						dayHeaderFormat: { weekday: 'short' },
						weekNumbers: true,
					},
					timeGridWeek: {
						firstDay: 1,
						slotDuration: '00:30:00',
						slotLabelInterval: '01:00:00',
						slotMinTime: '06:00:00',
						slotMaxTime: '21:00:00',
						allDaySlot: false,
						expandRows: false,
						nowIndicator: true,
						scrollTime: getCurrentTime(),
					},
					timeGridDay: {
						firstDay: 1,
						slotDuration: '00:30:00',
						slotMinTime: '06:00:00',
						slotMaxTime: '22:00:00',
						allDaySlot: false,
						scrollTime: getCurrentTime(),
					},
					listWeek: {
						firstDay: 1,
						listDayFormat: false,
						listDaySideFormat: { weekday: 'short', day: 'numeric' },
						scrollTime: getCurrentTime(),
					},
				}}
			/>
			{/* Event Modal */}
			<EventModal
				isOpen={isModalOpen}
				event={selectedEvent}
				onClose={() => setModalOpen(false)}
				onSubmit={(event) => {
					onEventSubmit(event);
					setModalOpen(false);
				}}
				onDelete={() => {
					onDeleteEvent(selectedEvent.id);
					setModalOpen(false);
				}}
			/>
		</div>
	);
}

export default CalendarView;
