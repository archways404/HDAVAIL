import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

function AssignShifts() {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// States
	const [group_id, setGroupId] = useState(null);
	const [schedule, setSchedule] = useState([]);
	const [assignments, setAssignments] = useState([]);
	const [activeAssignmentShift, setActiveAssignmentShift] = useState(null);
	const [submitting, setSubmitting] = useState(false); // ✅ Fix: Ensure submitting is defined

	// Fetch user's schedule group
	useEffect(() => {
		async function fetchUserGroup() {
			if (!user?.uuid) return;
			try {
				const response = await fetch(
					`${import.meta.env.VITE_BASE_ADDR}/get-user?uuid=${user.uuid}`
				);
				const data = await response.json();
				if (response.ok && data.scheduleGroups.length > 0) {
					setGroupId(
						data.scheduleGroups[0].group_id || data.scheduleGroups[0].id
					);
				} else {
					toast({
						description: 'No schedule groups found.',
						variant: 'destructive',
					});
				}
			} catch (error) {
				toast({
					description: 'Failed to fetch user group',
					variant: 'destructive',
				});
			}
		}
		fetchUserGroup();
	}, [user, toast]);

	// Fetch schedule based on group_id
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
				toast({
					description: 'Failed to fetch schedule',
					variant: 'destructive',
				});
			}
		}
		fetchSchedule();
	}, [group_id, toast]);

	// Select user for shift
	const handleSelectAvailablePerson = (
		shift_id,
		user_id,
		first_name,
		last_name
	) => {
		setAssignments((prev) =>
			prev.some((a) => a.shift_id === shift_id)
				? prev.map((a) =>
						a.shift_id === shift_id
							? { shift_id, user_id, first_name, last_name }
							: a
				  )
				: [...prev, { shift_id, user_id, first_name, last_name }]
		);
		setActiveAssignmentShift(null);
	};

	// Submit assignments
	const handleSubmitAssignments = async () => {
		if (assignments.length === 0) {
			toast({
				description: 'No assignments to submit',
				variant: 'destructive',
			});
			return;
		}
		setSubmitting(true);
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
			toast({
				description: 'Failed to submit assignments',
				variant: 'destructive',
			});
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Layout>
			<div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg">
				<h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
					Group Schedule
				</h1>

				{schedule.length === 0 ? (
					<p className="text-center text-gray-600 dark:text-gray-400">
						No schedule available.
					</p>
				) : (
					<div className="space-y-6">
						{schedule.map((shift) => {
							const assignedUser = assignments.find(
								(a) => a.shift_id === shift.shift_id
							);
							return (
								<div
									key={shift.shift_id}
									className={`p-4 border rounded-lg shadow-md transition-all ${
										assignedUser
											? 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
											: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
									}`}>
									<div className="flex justify-between items-center">
										<p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
											Shift #{shift.shift_id}
										</p>
										<Button
											onClick={() => setActiveAssignmentShift(shift)}
											className={`${
												assignedUser
													? 'bg-gray-500 dark:bg-gray-600'
													: 'bg-blue-500 hover:bg-blue-600'
											} text-white px-4 py-2 text-sm`}>
											{assignedUser ? 'Assigned' : 'Assign Shift'}
										</Button>
									</div>
									<p className="text-gray-600 dark:text-gray-300">
										<strong>Date:</strong> {shift.date}
									</p>
									<p className="text-gray-600 dark:text-gray-300">
										<strong>Time:</strong> {shift.start_time} - {shift.end_time}
									</p>
									<p className="text-gray-600 dark:text-gray-300">
										<strong>Description:</strong> {shift.description}
									</p>

									{assignedUser && (
										<p className="mt-2 text-green-600 dark:text-green-400">
											<strong>Assigned to:</strong> {assignedUser.first_name}{' '}
											{assignedUser.last_name}
										</p>
									)}
								</div>
							);
						})}
					</div>
				)}

				{/* Assignment Modal */}
				{activeAssignmentShift && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
							<h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
								Select a user for Shift #{activeAssignmentShift.shift_id}
							</h2>
							<ul className="space-y-2">
								{activeAssignmentShift.available_people?.length ? (
									activeAssignmentShift.available_people.map((person) => (
										<li
											key={person.user_id}
											className="border p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
											onClick={() =>
												handleSelectAvailablePerson(
													activeAssignmentShift.shift_id,
													person.user_id,
													person.first_name,
													person.last_name
												)
											}>
											{person.first_name} {person.last_name}
										</li>
									))
								) : (
									<p className="text-gray-600 dark:text-gray-400">
										No available users.
									</p>
								)}
							</ul>
						</div>
					</div>
				)}

				{/* Submit Button */}
				{assignments.length > 0 && (
					<div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-md">
						<Button
							onClick={handleSubmitAssignments}
							disabled={submitting}
							className="w-full bg-green-500 hover:bg-green-600 text-white">
							{submitting ? 'Submitting...' : 'Submit Assignments'}
						</Button>
					</div>
				)}
			</div>
		</Layout>
	);
}

export default AssignShifts;
