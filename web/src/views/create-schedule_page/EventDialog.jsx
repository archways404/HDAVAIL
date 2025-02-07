// EventDialog.jsx
import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EventDialog = ({
	isOpen,
	onClose,
	eventData,
	onSave,
	onDelete,
	shiftTypes,
	defaultGroupId, // New prop for default group id
	defaultGroupName, // New prop for default group name
}) => {
	// Local state for form fields.
	const [title, setTitle] = useState('');
	const [start, setStart] = useState('');
	const [end, setEnd] = useState('');
	const [description, setDescription] = useState('');

	// Additional fields for extendedProps.
	const [templateId, setTemplateId] = useState('');
	const [shiftTypeId, setShiftTypeId] = useState('');
	const [groupId, setGroupId] = useState('');
	const [groupName, setGroupName] = useState('');
	const [weekday, setWeekday] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');

	// Helper: Format date/time for input type="datetime-local"
	const formatDatetimeLocal = (value) => {
		if (!value) return '';
		const dt = new Date(value);
		const year = dt.getFullYear();
		const month = String(dt.getMonth() + 1).padStart(2, '0');
		const day = String(dt.getDate()).padStart(2, '0');
		const hours = String(dt.getHours()).padStart(2, '0');
		const minutes = String(dt.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	// Helper: Extract just the date portion in YYYY-MM-DD format.
	const extractDate = (value) => {
		if (!value) return '';
		const dt = new Date(value);
		const year = dt.getFullYear();
		const month = String(dt.getMonth() + 1).padStart(2, '0');
		const day = String(dt.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// Update local state when eventData changes.
	useEffect(() => {
		if (eventData) {
			setTitle(eventData.title || '');
			if (eventData.id && eventData.start && eventData.end) {
				setStart(formatDatetimeLocal(eventData.start));
				setEnd(formatDatetimeLocal(eventData.end));
			} else {
				const dateOnly = extractDate(eventData.start);
				// For a new event, prefill the date but set time to midnight.
				setStart(`${dateOnly}T00:00:00`);
				setEnd(`${dateOnly}T00:00:00`);
			}
			setDescription(eventData.extendedProps?.description || '');
			setTemplateId(eventData.extendedProps?.template_id || '');
			setShiftTypeId(eventData.extendedProps?.shift_type_id || '');
			// Use the eventData value if present; otherwise, fall back to the defaults.
			setGroupId(eventData.extendedProps?.group_id || defaultGroupId || '');
			setGroupName(
				eventData.extendedProps?.group_name || defaultGroupName || ''
			);
			setWeekday(eventData.extendedProps?.weekday || '');
			setStartTime(eventData.extendedProps?.start_time || '');
			setEndTime(eventData.extendedProps?.end_time || '');
		}
	}, [eventData, defaultGroupId, defaultGroupName]);

	// When shiftTypeId changes, update the title based on the passed-in shiftTypes.
	useEffect(() => {
		const found = shiftTypes.find((st) => st.shift_type_id === shiftTypeId);
		if (found) {
			setTitle(found.name_short);
		} else {
			setTitle('');
		}
	}, [shiftTypeId, shiftTypes]);

	const handleSave = () => {
		const updatedEvent = {
			...eventData,
			title,
			start,
			end,
			extendedProps: {
				...eventData.extendedProps,
				description,
				template_id: templateId,
				shift_type_id: shiftTypeId,
				group_id: groupId,
				group_name: groupName,
				weekday,
				start_time: startTime,
				end_time: endTime,
			},
		};
		onSave(updatedEvent);
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{eventData && eventData.id ? 'Edit Event' : 'New Event'}
					</DialogTitle>
					<DialogDescription>
						{eventData && eventData.id
							? 'Update your event details below.'
							: 'Enter details for your new event.'}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{/* Shift Type Dropdown */}
					<div>
						<label className="block text-xs font-medium mb-1">Shift Type</label>
						<Select
							defaultValue={shiftTypeId}
							value={shiftTypeId}
							onValueChange={setShiftTypeId}>
							<SelectTrigger className="w-full border rounded p-2">
								<SelectValue placeholder="Select shift type" />
							</SelectTrigger>
							<SelectContent>
								{shiftTypes.map((st) => (
									<SelectItem
										key={st.shift_type_id}
										value={st.shift_type_id}>
										{st.name_short}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{/* Date & Time Fields */}
					<div>
						<label className="block text-sm font-medium mb-1">Start</label>
						<Input
							type="datetime-local"
							value={start}
							onChange={(e) => setStart(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">End</label>
						<Input
							type="datetime-local"
							value={end}
							onChange={(e) => setEnd(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Description
						</label>
						<Input
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter className="mt-4 flex justify-end space-x-2">
					{eventData && eventData.id && (
						<Button
							variant="destructive"
							onClick={() => {
								onDelete(eventData);
								onClose();
							}}>
							Delete
						</Button>
					)}
					<Button onClick={handleSave}>Save</Button>
					<Button
						variant="outline"
						onClick={onClose}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EventDialog;
