import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

function ShiftSelector({ shifts, user, groupId, toast, setUnassignedShifts }) {
	const [selectedShifts, setSelectedShifts] = useState([]);
	const [submitting, setSubmitting] = useState(false);

	const handleShiftToggle = (shiftId) => {
		setSelectedShifts((prevSelected) =>
			prevSelected.includes(shiftId)
				? prevSelected.filter((id) => id !== shiftId)
				: [...prevSelected, shiftId]
		);
	};

	const handleApplyShifts = async () => {
		if (selectedShifts.length === 0) {
			toast({ description: 'No shifts selected.', variant: 'destructive' });
			return;
		}

		setSubmitting(true);

		// Submit selected shifts (your backend logic here)
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/insertAvailableForShifts`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: user.uuid,
						shift_ids: selectedShifts,
					}),
				}
			);

			const data = await response.json();

			if (response.ok) {
				toast({
					description: 'Shifts applied successfully!',
					variant: 'success',
				});

				// Remove applied shifts from the unassigned list
				setUnassignedShifts((prevShifts) =>
					prevShifts.filter((shift) => !selectedShifts.includes(shift.shift_id))
				);
			} else {
				toast({
					description: data.error || 'Failed to apply shifts.',
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({ description: 'Error applying shifts.', variant: 'destructive' });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			{/* Render shifts list */}
			{shifts.length === 0 ? (
				<p>No unassigned shifts available.</p>
			) : (
				shifts.map((shift) => (
					<div
						key={shift.shift_id}
						className="shift-item">
						<input
							type="checkbox"
							id={shift.shift_id}
							checked={selectedShifts.includes(shift.shift_id)}
							onChange={() => handleShiftToggle(shift.shift_id)}
						/>
						<label htmlFor={shift.shift_id}>
							{shift.start_time} - {shift.end_time} on{' '}
							{new Date(shift.date).toLocaleDateString()}
						</label>
					</div>
				))
			)}

			{/* Apply button */}
			<Button
				onClick={handleApplyShifts}
				disabled={submitting || selectedShifts.length === 0}>
				{submitting ? 'Applying...' : 'Apply Selected Shifts'}
			</Button>
		</div>
	);
}

export default ShiftSelector;
