import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

function ShiftSelector({ shifts, user, groupId, toast, setUnassignedShifts }) {
	const [selectedShifts, setSelectedShifts] = useState([]);
	const [submitting, setSubmitting] = useState(false);

	// Group shifts by their date
	const groupedShifts = shifts.reduce((acc, shift) => {
		const shiftDate = new Date(shift.date).toLocaleDateString(); // Format the date as a readable string
		if (!acc[shiftDate]) {
			acc[shiftDate] = [];
		}
		acc[shiftDate].push(shift);
		return acc;
	}, {});

	// Handle toggle of a shift selection
	const handleShiftToggle = (shiftId) => {
		setSelectedShifts((prevSelected) =>
			prevSelected.includes(shiftId)
				? prevSelected.filter((id) => id !== shiftId)
				: [...prevSelected, shiftId]
		);
	};

	// Apply selected shifts (e.g., API call to save them)
	const handleApplyShifts = async () => {
		if (selectedShifts.length === 0) {
			toast({ description: 'No shifts selected.', variant: 'destructive' });
			return;
		}

		setSubmitting(true);
		try {
			// Assuming there's an API to apply selected shifts
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/insertAvailableForShifts`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						user_id: user.uuid,
						group_id: groupId,
						shift_ids: selectedShifts,
					}),
				}
			);

			if (response.ok) {
				toast({
					description: 'Shifts applied successfully!',
					variant: 'success',
				});

				// Remove applied shifts from the list of unassigned shifts
				setUnassignedShifts((prevShifts) =>
					prevShifts.filter((shift) => !selectedShifts.includes(shift.shift_id))
				);
				setSelectedShifts([]); // Clear selected shifts
			} else {
				toast({
					description: 'Failed to apply shifts. Please try again.',
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
		<div className="space-y-6">
			{/* Render shifts grouped by date */}
			{Object.keys(groupedShifts).length === 0 ? (
				<p>No unassigned shifts available.</p>
			) : (
				Object.keys(groupedShifts).map((date) => (
					<div key={date}>
						<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
							{date}
						</h3>{' '}
						{/* Date header */}
						<div className="space-y-4 mt-2">
							{groupedShifts[date].map((shift) => (
								<div
									key={shift.shift_id}
									className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
									<div className="flex items-center space-x-4">
										<input
											type="checkbox"
											id={shift.shift_id}
											checked={selectedShifts.includes(shift.shift_id)}
											onChange={() => handleShiftToggle(shift.shift_id)}
											className="h-5 w-5 accent-blue-500"
										/>
										<label
											htmlFor={shift.shift_id}
											className="flex-1 text-gray-700 dark:text-gray-300">
											<div className="font-medium">{shift.name_short}</div>
											<div>
												{shift.start_time.slice(0, 5)} -{' '}
												{shift.end_time.slice(0, 5)} {/* Shorten time */}
											</div>
											{/* If description is available */}
											{shift.description && shift.description !== 'null' ? (
												<p className="text-gray-600 dark:text-gray-400">
													{shift.description}
												</p>
											) : (
												<p className="text-gray-500 dark:text-gray-400 italic">
													No description available
												</p>
											)}
										</label>
									</div>
								</div>
							))}
						</div>
					</div>
				))
			)}

			{/* Apply Button */}
			<Button
				onClick={handleApplyShifts}
				disabled={submitting || selectedShifts.length === 0}
				className={`w-full py-3 font-semibold ${
					submitting || selectedShifts.length === 0
						? 'bg-gray-400 cursor-not-allowed'
						: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
				}`}>
				{submitting ? 'Applying...' : 'Apply Selected Shifts'}
			</Button>
		</div>
	);
}

export default ShiftSelector;
