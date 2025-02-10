import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

function ApplyUnassigned({ group_id: propGroupId, shift_type_id, date }) {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// State management
	const [group_id, setGroupId] = useState(propGroupId || null);
	const [unassignedShifts, setUnassignedShifts] = useState([]);
	const [selectedShiftIds, setSelectedShiftIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Fetch the user's schedule groups if no `group_id` is provided
	useEffect(() => {
		async function fetchUserGroup() {
			if (!user?.uuid) return;
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/get-user?uuid=${user.uuid}`
				);
				const data = await response.json();
				if (response.ok) {
					if (data.scheduleGroups?.length > 0) {
						setGroupId(
							data.scheduleGroups[0].group_id || data.scheduleGroups[0].id
						);
					} else {
						toast({
							description: 'No schedule groups found.',
							variant: 'destructive',
						});
					}
				} else {
					toast({ description: data.error, variant: 'destructive' });
				}
			} catch (error) {
				toast({
					description: 'Failed to fetch user group.',
					variant: 'destructive',
				});
			}
		}

		if (!propGroupId) {
			fetchUserGroup();
		} else {
			setGroupId(propGroupId);
		}
	}, [propGroupId, user, toast]);

	// Fetch unassigned shifts
	useEffect(() => {
		if (!group_id || !user?.uuid) return;
		setLoading(true);
		async function fetchShifts() {
			try {
				const queryParams = new URLSearchParams({
					group_id,
					user_id: user.uuid,
					...(shift_type_id && { shift_type_id }),
					...(date && { date }),
				}).toString();

				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/getUnassignedShifts?${queryParams}`
				);
				const data = await response.json();

				if (response.ok) {
					setUnassignedShifts(data.unassigned_shifts);
				} else {
					toast({ description: data.error, variant: 'destructive' });
				}
			} catch (error) {
				toast({
					description: 'Failed to fetch unassigned shifts.',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		}

		fetchShifts();
	}, [group_id, shift_type_id, date, user, toast]);

	// Toggle shift selection
	const handleSelectShift = (shiftId) => {
		setSelectedShiftIds((prev) =>
			prev.includes(shiftId)
				? prev.filter((id) => id !== shiftId)
				: [...prev, shiftId]
		);
	};

	// Submit selected shifts
	const handleSubmitSelected = async () => {
		if (!user?.uuid) {
			toast({ description: 'User not logged in.', variant: 'destructive' });
			return;
		}
		if (selectedShiftIds.length === 0) {
			toast({ description: 'No shifts selected.', variant: 'destructive' });
			return;
		}

		setSubmitting(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/insertAvailableForShifts`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						shift_ids: selectedShiftIds,
						user_id: user.uuid,
					}),
				}
			);
			const result = await response.json();

			if (response.ok) {
				toast({ description: result.message, variant: 'default' });
				setSelectedShiftIds([]); // Clear selection after submission
			} else {
				toast({ description: result.error, variant: 'destructive' });
			}
		} catch (error) {
			toast({
				description: 'Failed to submit selected shifts.',
				variant: 'destructive',
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Layout>
			<div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-md rounded-lg">
				<h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
					Unassigned Shifts
				</h1>

				{/* Loading state */}
				{loading ? (
					<div className="flex justify-center items-center py-10">
						<Loader />
					</div>
				) : unassignedShifts.length === 0 ? (
					<p className="text-gray-600 dark:text-gray-400 text-center">
						No unassigned shifts found.
					</p>
				) : (
					<ul className="space-y-3">
						{unassignedShifts.map((shift) => (
							<li
								key={shift.shift_id}
								onClick={() => handleSelectShift(shift.shift_id)}
								className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-3 
								${
									selectedShiftIds.includes(shift.shift_id)
										? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500'
										: 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
								}`}>
								<input
									type="checkbox"
									className="h-5 w-5 accent-blue-500"
									checked={selectedShiftIds.includes(shift.shift_id)}
									onChange={() => handleSelectShift(shift.shift_id)}
								/>
								<div className="flex-1">
									<p className="font-semibold text-gray-800 dark:text-gray-100">
										Shift ID:{' '}
										<span className="text-gray-600 dark:text-gray-300">
											{shift.shift_id}
										</span>
									</p>
									<p className="text-gray-600 dark:text-gray-400">
										<strong>Date:</strong> {shift.date}
									</p>
									<p className="text-gray-600 dark:text-gray-400">
										<strong>Time:</strong> {shift.start_time} - {shift.end_time}
									</p>
									<p className="text-gray-600 dark:text-gray-400">
										<strong>Description:</strong> {shift.description}
									</p>
								</div>
							</li>
						))}
					</ul>
				)}

				{/* Submit button */}
				<div className="mt-6 flex justify-end">
					<Button
						onClick={handleSubmitSelected}
						disabled={submitting || selectedShiftIds.length === 0}
						className={`px-6 py-2 font-semibold transition-colors 
						${
							selectedShiftIds.length > 0
								? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
								: 'bg-gray-400 dark:bg-gray-600'
						}`}>
						{submitting ? 'Submitting...' : 'Submit Selected Shifts'}
					</Button>
				</div>
			</div>
		</Layout>
	);
}

export default ApplyUnassigned;
