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
		<div className="space-y-10">
			{' '}
			{/* Increased space between date groups */}
			{/* Render shifts grouped by date */}
			{Object.keys(groupedShifts).length === 0 ? (
				<p>No unassigned shifts available.</p>
			) : (
				Object.keys(groupedShifts)
					.sort((a, b) => new Date(a) - new Date(b)) // Sort dates from earliest to latest
					.map((date, index, array) => (
						<div
							key={date}
							className="relative space-y-4">
							{/* Date Header */}
							<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide uppercase bg-gray-200 dark:bg-gray-700 py-3 px-5 rounded-md shadow-sm">
								{date}
							</h3>

							{/* Shift Cards */}
							<div className="space-y-4 mt-2">
								{groupedShifts[date].map((shift, shiftIndex) => {
									const isSelected = selectedShifts.includes(shift.shift_id);
									return (
										<div
											key={shift.shift_id}
											className={`p-4 rounded-lg shadow-md transition-all duration-300 cursor-pointer border ${
												isSelected
													? 'bg-blue-600 text-white border-blue-700 shadow-lg'
													: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:shadow-lg'
											} ${
												shiftIndex === groupedShifts[date].length - 1
													? 'border-b-2 border-gray-300 dark:border-gray-700'
													: ''
											}`}
											onClick={() => handleShiftToggle(shift.shift_id)}>
											<div className="flex items-center space-x-4">
												<input
													type="checkbox"
													id={shift.shift_id}
													checked={isSelected}
													onChange={() => handleShiftToggle(shift.shift_id)}
													className="h-5 w-5 accent-blue-500"
												/>
												<label
													htmlFor={shift.shift_id}
													className={`flex-1 ${
														isSelected
															? 'text-white'
															: 'text-gray-800 dark:text-gray-300'
													}`}>
													<div className="font-medium">{shift.name_short}</div>
													<div className="text-sm">
														{shift.start_time.slice(0, 5)} -{' '}
														{shift.end_time.slice(0, 5)}
													</div>
													{shift.description && shift.description !== 'null' ? (
														<p
															className={`text-sm ${
																isSelected
																	? 'text-white'
																	: 'text-gray-600 dark:text-gray-400'
															}`}>
															{shift.description}
														</p>
													) : (
														<p
															className={`text-sm italic ${
																isSelected
																	? 'text-gray-300'
																	: 'text-gray-500 dark:text-gray-400'
															}`}>
															No description available
														</p>
													)}
												</label>
											</div>
										</div>
									);
								})}
							</div>

							{/* Bottom Separator Line between Date Groups */}
							{index !== array.length - 1 && (
								<div className="border-t-2 border-gray-300 dark:border-gray-700 mt-6"></div>
							)}
						</div>
					))
			)}
			{/* Apply Button */}
			<Button
				onClick={handleApplyShifts}
				disabled={submitting || selectedShifts.length === 0}
				className={`w-full py-3 font-semibold mt-6 rounded-lg transition-all ${
					submitting || selectedShifts.length === 0
						? 'bg-gray-400 cursor-not-allowed'
						: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
				}`}>
				{submitting ? 'Applying...' : 'Apply Selected Shifts'}
			</Button>
		</div>
	);
}

export default ShiftSelector;
