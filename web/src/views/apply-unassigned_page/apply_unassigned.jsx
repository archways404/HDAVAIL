// apply-unassigned.jsx
import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

function ApplyUnassigned({ group_id: propGroupId, shift_type_id, date }) {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// State for the group id; if not provided as a prop, we will fetch it.
	const [group_id, setGroupId] = useState(propGroupId || null);
	// State for the unassigned shifts.
	const [unassignedShifts, setUnassignedShifts] = useState([]);
	// State for the selected shift IDs.
	const [selectedShiftIds, setSelectedShiftIds] = useState([]);

	// If no group_id was passed in as a prop, fetch the user's schedule groups.
	useEffect(() => {
		async function fetchUserGroup() {
			if (!user?.uuid) return;
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/get-user?uuid=${user.uuid}`
				);
				const data = await response.json();
				if (response.ok) {
					// Assume scheduleGroups is an array; pick the first group.
					if (data.scheduleGroups && data.scheduleGroups.length > 0) {
						// Adjust the property name as returned by your endpoint.
						const firstGroup = data.scheduleGroups[0];
						setGroupId(firstGroup.group_id || firstGroup.id);
					} else {
						toast({
							description: 'No schedule groups found for user',
							variant: 'destructive',
						});
					}
				} else {
					toast({ description: data.error, variant: 'destructive' });
				}
			} catch (error) {
				console.error(error);
				toast({
					description: 'Failed to fetch user group',
					variant: 'destructive',
				});
			}
		}
		// Only fetch if we don't already have a group_id.
		if (!propGroupId) {
			fetchUserGroup();
		} else {
			setGroupId(propGroupId);
		}
	}, [propGroupId, user, toast]);

	// Fetch unassigned shifts whenever group_id, shift_type_id, or date changes.
	useEffect(() => {
		// Ensure that both group_id and user exist before fetching.
		if (!group_id || !user?.uuid) return;
		async function fetchShifts() {
			try {
				// Build query string with the required group_id and user_id, plus optional filters.
				let queryParams = `group_id=${group_id}&user_id=${user.uuid}`;
				if (shift_type_id) queryParams += `&shift_type_id=${shift_type_id}`;
				if (date) queryParams += `&date=${date}`;

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
				console.error(error);
				toast({
					description: 'Failed to fetch unassigned shifts',
					variant: 'destructive',
				});
			}
		}
		fetchShifts();
	}, [group_id, shift_type_id, date, user, toast]);

	// Toggle selection of a shift.
	const handleSelectShift = (shiftId) => {
		setSelectedShiftIds((prevSelected) =>
			prevSelected.includes(shiftId)
				? prevSelected.filter((id) => id !== shiftId)
				: [...prevSelected, shiftId]
		);
	};

	// Submit the selected shift IDs via the POST endpoint.
	const handleSubmitSelected = async () => {
		if (!user?.uuid) {
			toast({ description: 'User not logged in', variant: 'destructive' });
			return;
		}
		if (selectedShiftIds.length === 0) {
			toast({ description: 'No shifts selected', variant: 'destructive' });
			return;
		}
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
				// Optionally, clear selected shifts after submission.
				setSelectedShiftIds([]);
			} else {
				toast({ description: result.error, variant: 'destructive' });
			}
		} catch (error) {
			console.error(error);
			toast({
				description: 'Failed to submit selected shifts',
				variant: 'destructive',
			});
		}
	};

	return (
		<Layout>
			<div className="p-4">
				<h1 className="text-xl font-bold mb-4">Unassigned Shifts</h1>
				{unassignedShifts.length === 0 ? (
					<p>No unassigned shifts found.</p>
				) : (
					<ul>
						{unassignedShifts.map((shift) => (
							<li
								key={shift.shift_id}
								onClick={() => handleSelectShift(shift.shift_id)}
								className={`p-2 border rounded mb-2 cursor-pointer transition-colors ${
									selectedShiftIds.includes(shift.shift_id)
										? 'bg-blue-100'
										: 'bg-white'
								}`}>
								<p>
									<strong>Shift ID:</strong> {shift.shift_id}
								</p>
								<p>
									<strong>Date:</strong> {shift.date}
								</p>
								<p>
									<strong>Time:</strong> {shift.start_time} - {shift.end_time}
								</p>
								<p>
									<strong>Description:</strong> {shift.description}
								</p>
							</li>
						))}
					</ul>
				)}
				<div className="mt-4">
					<Button onClick={handleSubmitSelected}>Submit Selected Shifts</Button>
				</div>
			</div>
		</Layout>
	);
}

export default ApplyUnassigned;
