import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // For week and day views
import interactionPlugin from '@fullcalendar/interaction'; // needed for event interactions like dragging and resizing
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover'; // Import ShadCN Popover
import Layout from '../components/Layout';

const CreateSchedule = () => {
	const [scheduleData, setScheduleData] = useState([]); // Array to store events
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeEvent, setActiveEvent] = useState(null); // For popover editing

	// Fetch schedule template data for next month
	useEffect(() => {
		const fetchScheduleTemplate = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/scheduleTemplate`
				);
				const data = await response.json();
				const formattedData = formatScheduleData(data);
				setScheduleData(formattedData);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching schedule template:', error);
				setLoading(false);
			}
		};

		fetchScheduleTemplate();
	}, []);

	// Format the schedule data for FullCalendar
	const formatScheduleData = (data) => {
		let events = [];
		Object.keys(data).forEach((date) => {
			data[date].forEach((event) => {
				events.push({
					title: event.name,
					start: `${date}T${event.startDate}`,
					end: `${date}T${event.endDate}`,
					extendedProps: {
						rawData: event,
					},
				});
			});
		});
		return events;
	};

	// Handle selecting an event to edit
	const handleEventClick = (clickInfo) => {
		setActiveEvent(clickInfo.event);
	};

	// Handle saving the modified event
	const handleSaveEvent = () => {
		const updatedEvents = scheduleData.map((event) =>
			event.start === activeEvent.start ? { ...event, ...activeEvent } : event
		);
		setScheduleData(updatedEvents);
		setActiveEvent(null); // Close popover
	};

	// Handle input change for editing event
	const handleInputChange = (field, value) => {
		setActiveEvent({
			...activeEvent,
			[field]: value,
		});
	};

	// Handle submitting the customized schedule
	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/createSchedule`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(scheduleData),
				}
			);
			if (!response.ok) {
				throw new Error('Failed to submit schedule');
			}
			alert('Schedule submitted successfully');
		} catch (error) {
			console.error('Error submitting schedule:', error);
			alert('Failed to submit schedule');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Set the initial date to the next month
	const getNextMonth = () => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 1); // Next month
	};

	if (loading) {
		return <p>Loading schedule template...</p>;
	}

	return (
		<Layout>
			<div className="flex justify-center items-center mb-8 mt-4 space-x-6">
				<div className="text-center">
					<div className="text-2xl font-bold text-white">
						{new Date().getFullYear()}
					</div>
					<div className="text-lg text-gray-300">
						{new Date().toLocaleString('default', { month: 'long' })}
					</div>
				</div>
				<button
					className="p-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700"
					onClick={handleSubmit}
					disabled={isSubmitting}>
					{isSubmitting ? 'Submitting...' : 'Submit Schedule'}
				</button>
			</div>
			<div className="container mx-auto p-4 max-w-screen-xl">
				<FullCalendar
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					initialView="dayGridMonth" // Default view
					initialDate={getNextMonth()} // Set to next month by default
					firstDay={1} // Make Monday the first day of the week
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: 'dayGridMonth,timeGridWeek,timeGridDay',
					}} // Show buttons for month, week, and day view
					events={scheduleData}
					editable={true}
					selectable={true}
					eventClick={handleEventClick}
					allDaySlot={false} // Disable the "all-day" slot
					slotMinTime="06:00:00" // Start the time grid at 5 AM
					slotMaxTime="23:00:00" // End the time grid at midnight
				/>
			</div>

			{/* Popover for editing events */}
			{activeEvent && (
				<Popover
					open={true}
					onClose={() => setActiveEvent(null)}>
					<PopoverContent>
						<div className="p-4">
							<h3 className="text-lg font-bold mb-4">Edit Schedule Entry</h3>
							<div>
								<label className="block mb-2">Name</label>
								<input
									type="text"
									value={activeEvent.title}
									onChange={(e) => handleInputChange('title', e.target.value)}
									className="border border-gray-300 p-2 rounded w-full"
								/>
							</div>
							<div>
								<label className="block mb-2">Start Time</label>
								<input
									type="time"
									value={new Date(activeEvent.start).toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}
									onChange={(e) => handleInputChange('start', e.target.value)}
									className="border border-gray-300 p-2 rounded w-full"
								/>
							</div>
							<div>
								<label className="block mb-2">End Time</label>
								<input
									type="time"
									value={new Date(activeEvent.end).toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}
									onChange={(e) => handleInputChange('end', e.target.value)}
									className="border border-gray-300 p-2 rounded w-full"
								/>
							</div>
							<button
								className="mt-4 p-2 bg-blue-600 text-white rounded"
								onClick={handleSaveEvent}>
								Save
							</button>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</Layout>
	);
};

export default CreateSchedule;
