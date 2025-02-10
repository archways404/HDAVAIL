// assign_shifts.jsx
import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

function AssignShifts() {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// State for the group id fetched from the user details.
	const [group_id, setGroupId] = useState(null);
	// State for the schedule fetched from the backend.
	const [schedule, setSchedule] = useState([]);
	// State for assignments: an array of { shift_id, user_id }.
	const [assignments, setAssignments] = useState([]);
	// State to store which shift is currently active for assignment.
	const [activeAssignmentShift, setActiveAssignmentShift] = useState(null);

	// Fetch the user's schedule groups if no group_id is set.
	useEffect(() => {
		async function fetchUserGroup() {
			if (!user?.uuid) return;
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/get-user?uuid=${user.uuid}`
				);
				const data = await response.json();
				if (response.ok) {
					if (data.scheduleGroups && data.scheduleGroups.length > 0) {
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
		fetchUserGroup();
	}, [user, toast]);

	// Fetch schedule from /getScheduleForGroup when group_id changes.
	useEffect(() => {
		async function fetchSchedule() {
			if (!group_id) return;
			try {
				const response = await fetch(
					`${
						import.meta.env.VITE_BASE_ADDR
					}/getScheduleForGroup?group_id=${group_id}`
				);
				const data = await response.json();
				if (response.ok) {
					setSchedule(data.schedule);
				} else {
					toast({ description: data.error, variant: 'destructive' });
				}
			} catch (error) {
				console.error(error);
				toast({
					description: 'Failed to fetch schedule',
					variant: 'destructive',
				});
			}
		}
		fetchSchedule();
	}, [group_id, toast]);

	// Open the assignment modal for a specific shift.
	const handleOpenAssignment = (shift) => {
		setActiveAssignmentShift(shift);
	};

	// When a user is selected for a shift.
	const handleSelectAvailablePerson = (shift_id, user_id) => {
		// Add or update the assignment for this shift.
		setAssignments((prev) => {
			const existing = prev.find((a) => a.shift_id === shift_id);
			if (existing) {
				return prev.map((a) =>
					a.shift_id === shift_id ? { shift_id, user_id } : a
				);
			} else {
				return [...prev, { shift_id, user_id }];
			}
		});
		setActiveAssignmentShift(null);
	};

	// Submit all assignments via the POST endpoint.
	const handleSubmitAssignments = async () => {
		if (assignments.length === 0) {
			toast({
				description: 'No assignments to submit',
				variant: 'destructive',
			});
			return;
		}
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/assignShifts`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ assignments }),
				}
			);
			const result = await response.json();
			if (response.ok) {
				toast({ description: result.message, variant: 'default' });
				setAssignments([]);
			} else {
				toast({ description: result.error, variant: 'destructive' });
			}
		} catch (error) {
			console.error(error);
			toast({
				description: 'Failed to submit assignments',
				variant: 'destructive',
			});
		}
	};

	return (
		<Layout>
			<div className="p-4">
				<h1 className="text-2xl font-bold mb-4">Group Schedule</h1>
				{schedule.length === 0 ? (
					<p>No schedule available.</p>
				) : (
					<div className="space-y-6">
						{schedule.map((shift) => (
							<div
								key={shift.shift_id}
								className="p-4 border rounded shadow-sm">
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
								<div className="mt-2">
									<p className="font-semibold">Available People:</p>
									{shift.available_people &&
									shift.available_people.length > 0 ? (
										<ul className="list-disc pl-5">
											{shift.available_people.map((person) => (
												<li key={person.user_id}>
													{person.first_name} {person.last_name}
												</li>
											))}
										</ul>
									) : (
										<p className="text-sm italic text-gray-500">
											No available people.
										</p>
									)}
								</div>
								<div className="mt-2">
									<Button
										onClick={() => handleOpenAssignment(shift)}
										className="bg-blue-500 hover:bg-blue-600 text-white">
										Assign This Shift
									</Button>
								</div>
								{assignments.find((a) => a.shift_id === shift.shift_id) && (
									<p className="mt-2 text-green-600">
										Assigned to:{' '}
										{(() => {
											const assignment = assignments.find(
												(a) => a.shift_id === shift.shift_id
											);
											const person = shift.available_people.find(
												(p) => p.user_id === assignment.user_id
											);
											return person
												? `${person.first_name} ${person.last_name}`
												: assignment.user_id;
										})()}
									</p>
								)}
							</div>
						))}
					</div>
				)}

				{/* Modal for selecting an available user */}
				{activeAssignmentShift && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
							<h2 className="text-xl font-bold mb-4">
								Select a user for shift {activeAssignmentShift.shift_id}
							</h2>
							{activeAssignmentShift.available_people &&
							activeAssignmentShift.available_people.length > 0 ? (
								<ul className="space-y-2">
									{activeAssignmentShift.available_people.map((person) => (
										<li
											key={person.user_id}
											className="border p-2 rounded cursor-pointer hover:bg-gray-100"
											onClick={() =>
												handleSelectAvailablePerson(
													activeAssignmentShift.shift_id,
													person.user_id
												)
											}>
											{person.first_name} {person.last_name}
										</li>
									))}
								</ul>
							) : (
								<p>No available users for this shift.</p>
							)}
							<div className="mt-4 flex justify-end">
								<Button
									onClick={() => setActiveAssignmentShift(null)}
									className="bg-gray-500 hover:bg-gray-600 text-white">
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Display current assignments and submit button */}
				{assignments.length > 0 && (
					<div className="mt-6 border p-4 rounded">
						<h2 className="text-xl font-bold mb-2">Current Assignments</h2>
						<ul className="list-disc pl-5">
							{assignments.map((assignment) => (
								<li key={assignment.shift_id}>
									Shift {assignment.shift_id} assigned to user{' '}
									{assignment.user_id}
								</li>
							))}
						</ul>
						<div className="mt-4">
							<Button
								onClick={handleSubmitAssignments}
								className="bg-green-500 hover:bg-green-600 text-white">
								Submit Assignments
							</Button>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}

export default AssignShifts;
