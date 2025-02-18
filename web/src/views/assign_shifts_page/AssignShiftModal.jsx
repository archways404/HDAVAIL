import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';

function AssignShiftModal({ shift, onClose, onSelectUser }) {
	const [selectedUser, setSelectedUser] = useState(null);

	return (
		<Dialog
			open={!!shift}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{shift?.shift_type_short}</DialogTitle>
				</DialogHeader>

				{/* ComboBox for Selecting Available Users */}
				<Combobox
					items={
						shift?.available_people?.map((user) => ({
							value: user.user_id,
							label: `${user.first_name} ${user.last_name} (${user.email})`,
						})) || []
					}
					placeholder="Select an available user..."
					onChange={(value) => {
						const user = shift.available_people.find(
							(u) => u.user_id === value
						);
						setSelectedUser(user);
					}}
				/>

				{/* Confirm Assignment Button */}
				<Button
					disabled={!selectedUser}
					onClick={() => {
						if (selectedUser) {
							onSelectUser(shift.shift_id, selectedUser);
							onClose();
						}
					}}
					className="w-full mt-4">
					Assign Shift
				</Button>

				{/* Close Modal */}
				<Button
					variant="outline"
					onClick={onClose}
					className="w-full">
					Cancel
				</Button>
			</DialogContent>
		</Dialog>
	);
}

export default AssignShiftModal;
