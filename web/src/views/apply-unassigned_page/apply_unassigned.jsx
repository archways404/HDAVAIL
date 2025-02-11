import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import GroupSelector from './GroupSelector';
import ShiftSelector from './ShiftSelector';

function ApplyUnassigned() {
	const { user } = useContext(AuthContext);
	const { toast } = useToast();

	// State management
	const [groupId, setGroupId] = useState(null);
	const [unassignedShifts, setUnassignedShifts] = useState([]);

	// Fetch unassigned shifts based on selected group
	useEffect(() => {
		if (groupId) {
			// Make API call to fetch unassigned shifts
			const fetchUnassignedShifts = async () => {
				try {
					const response = await fetch(
						`${
							import.meta.env.VITE_BASE_ADDR
						}/getUnassignedShifts?group_id=${groupId}&user_id=${user.uuid}`
					);
					const data = await response.json();

					if (response.ok) {
						setUnassignedShifts(data.unassigned_shifts || []);
					} else {
						toast({
							description: data.error || 'Failed to fetch unassigned shifts.',
							variant: 'destructive',
						});
					}
				} catch (error) {
					toast({
						description: 'Error fetching unassigned shifts.',
						variant: 'destructive',
					});
				}
			};

			fetchUnassignedShifts();
		}
	}, [groupId, user.uuid, toast]);

	return (
		<Layout>
			<div className="container">
				{/* GroupSelector to choose group */}
				<GroupSelector
					groups={user.groups}
					onGroupSelect={setGroupId}
				/>

				{/* If group is selected, show ShiftSelector */}
				{groupId && (
					<ShiftSelector
						shifts={unassignedShifts}
						user={user}
						groupId={groupId}
						toast={toast}
						setUnassignedShifts={setUnassignedShifts} // Passing function to update unassignedShifts
					/>
				)}
			</div>
		</Layout>
	);
}

export default ApplyUnassigned;
