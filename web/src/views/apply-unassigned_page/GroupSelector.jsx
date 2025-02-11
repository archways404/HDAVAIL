import React from 'react';

function GroupSelector({ groups, onGroupSelect }) {
	return (
		<div>
			<h2>Select a Group</h2>
			<select
				onChange={(e) => onGroupSelect(e.target.value)}
				defaultValue="">
				<option
					value=""
					disabled>
					Select a group
				</option>
				{groups.map((group) => (
					<option
						key={group.id}
						value={group.id}>
						{group.name || group.id} {/* Assuming 'name' or 'id' */}
					</option>
				))}
			</select>
		</div>
	);
}

export default GroupSelector;
