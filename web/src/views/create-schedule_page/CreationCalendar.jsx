import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import React, { useContext, useState, useEffect } from 'react';
import enGbLocale from '@fullcalendar/core/locales/en-gb';
import svLocale from '@fullcalendar/core/locales/sv';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Helper function to get current time in HH:MM:SS format.
function getCurrentTime() {
	const now = new Date();
	return now.toTimeString().split(' ')[0];
}

function CreationCalendar({
	selectedTemplate,
	selectedGroup,
	selectedYear,
	selectedMonth,
}) {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	const [events, setEvents] = useState([]);

	useEffect(() => {
		fetchEvents();
	}, [
		user,
		selectedTemplate,
		selectedGroup,
		selectedYear,
		selectedMonth,
		toast,
	]);

	const fetchEvents = async () => {
		if (
			!user ||
			!selectedTemplate ||
			!selectedGroup ||
			!selectedYear ||
			!selectedMonth
		)
			return;

		try {
			const url = `${import.meta.env.VITE_BASE_ADDR}/applyTemplate`;
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					user_id: user.uuid,
					template_id: selectedTemplate.id,
					group_id: selectedGroup.id,
					year: selectedYear,
					month: selectedMonth,
				}),
			});
			const data = await response.json();
			setEvents(data); // <-- This updates the state
			console.log('events', events);
		} catch (error) {
			console.error('Error fetching events:', error);
			toast({
				description: 'Error fetching events',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="w-full h-[calc(100vh-200px)]">
			<FullCalendar
				plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
				initialDate={`${selectedYear}-${String(selectedMonth).padStart(
					2,
					'0'
				)}-01`}
				initialView="dayGridMonth"
				editable={true}
				selectable={true}
				selectMirror={true}
				dayMaxEvents={true}
				events={events}
				locale={enGbLocale}
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
		</div>
	);
}

export default CreationCalendar;
