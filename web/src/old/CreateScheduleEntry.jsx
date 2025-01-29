import React, { useState, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function CreateScheduleEntry() {
	const { user } = useContext(AuthContext);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
			<div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
				<h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
					Create a new entry
				</h2>
			</div>
		</div>
	);
}

export default CreateScheduleEntry;
