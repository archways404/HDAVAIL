import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

const StatusMsg = () => {
	const { user } = useContext(AuthContext);

	const [statusMessages, setStatusMessages] = useState([]);
	const [statusTypes, setStatusTypes] = useState([]);
	const [newStatus, setNewStatus] = useState({
		message: '',
		type: '',
		active: true,
	});
	const [newStatusType, setNewStatusType] = useState({
		type: '',
		priority: '',
	});
	const [editingStatus, setEditingStatus] = useState(null);
	const [editingStatusType, setEditingStatusType] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			fetchStatusMessages();
			fetchStatusTypes();
		}
	}, [user]);

	const fetchStatusMessages = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/status/all'
			);
			const data = await response.json();
			setStatusMessages(data);
		} catch (error) {
			console.error('Error fetching status messages:', error);
		}
	};

	const fetchStatusTypes = async () => {
		try {
			const response = await fetch(
				import.meta.env.VITE_BASE_ADDR + '/status-types'
			);
			const data = await response.json();
			setStatusTypes(data);
		} catch (error) {
			console.error('Error fetching status types:', error);
		}
	};

	const handleCreateOrUpdateStatus = async () => {
		setLoading(true);
		try {
			const method = editingStatus ? 'PUT' : 'POST';
			const url = editingStatus
				? `${import.meta.env.VITE_BASE_ADDR}/status/${editingStatus.status_id}`
				: import.meta.env.VITE_BASE_ADDR + '/status';
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newStatus),
			});

			if (response.ok) {
				fetchStatusMessages();
				setNewStatus({ message: '', type: '', active: true });
				setEditingStatus(null);
			}
		} catch (error) {
			console.error('Error creating/updating status message:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateOrUpdateStatusType = async () => {
		setLoading(true);
		try {
			const method = editingStatusType ? 'PUT' : 'POST';
			const url = editingStatusType
				? `${import.meta.env.VITE_BASE_ADDR}/status-types/${
						editingStatusType.id
				  }`
				: import.meta.env.VITE_BASE_ADDR + '/status-types';
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newStatusType),
			});

			if (response.ok) {
				fetchStatusTypes();
				setNewStatusType({ type: '', priority: '' });
				setEditingStatusType(null);
			}
		} catch (error) {
			console.error('Error creating/updating status type:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditStatusType = (type) => {
		setEditingStatusType(type);
		setNewStatusType({ type: type.type, priority: type.priority });
	};

	const handleDeleteStatusType = async (id) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status-types/${id}`,
				{ method: 'DELETE' }
			);
			if (response.ok) {
				fetchStatusTypes();
			}
		} catch (error) {
			console.error('Error deleting status type:', error);
		}
	};

	const handleEditStatus = (status) => {
		setEditingStatus(status);
		setNewStatus({
			message: status.message,
			type: status.status_type,
			active: status.active,
		});
	};

	const handleDeleteStatus = async (id) => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BASE_ADDR}/status/${id}`,
				{ method: 'DELETE' }
			);
			if (response.ok) {
				fetchStatusMessages();
			}
		} catch (error) {
			console.error('Error deleting status message:', error);
		}
	};

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
				<h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
					Manage Status
				</h1>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column - Status Messages */}
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
						<h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
							{editingStatus
								? 'Edit Status Message'
								: 'Create New Status Message'}
						</h2>
						<form
							className="mb-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleCreateOrUpdateStatus();
							}}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Message
								</label>
								<input
									type="text"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={newStatus.message}
									onChange={(e) =>
										setNewStatus({ ...newStatus, message: e.target.value })
									}
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Status Type
								</label>
								<select
									className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={newStatus.type}
									onChange={(e) =>
										setNewStatus({ ...newStatus, type: e.target.value })
									}
									required>
									<option value="">Select Type</option>
									{statusTypes.map((type) => (
										<option
											key={type.id}
											value={type.id}>
											{type.type}
										</option>
									))}
								</select>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Active
								</label>
								<input
									type="checkbox"
									className="mt-1"
									checked={newStatus.active}
									onChange={(e) =>
										setNewStatus({ ...newStatus, active: e.target.checked })
									}
								/>
							</div>
							<button
								type="submit"
								className={`w-full py-2 px-4 text-white rounded-md ${
									loading
										? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed'
										: 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800'
								}`}
								disabled={loading}>
								{editingStatus ? 'Update Status' : 'Create Status'}
							</button>
						</form>
						<h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
							All Status Messages
						</h2>
						<div>
							{statusMessages.length > 0 ? (
								statusMessages.map((status) => (
									<div
										key={status.status_id}
										className="flex justify-between items-center mb-2 p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-md">
										<div>
											<p className="font-medium text-gray-800 dark:text-gray-200">
												{status.message}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Type: <span>{status.type}</span>
												<br />
												Priority: <span>{status.priority}</span>
												<br />
												Active: <span>{status.active ? 'Yes' : 'No'}</span>
											</p>
										</div>
										<div className="flex gap-2">
											<button
												className="px-2 py-1 text-sm text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-md"
												onClick={() => handleEditStatus(status)}>
												Edit
											</button>
											<button
												className="px-2 py-1 text-sm text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 rounded-md"
												onClick={() => handleDeleteStatus(status.status_id)}>
												Delete
											</button>
										</div>
									</div>
								))
							) : (
								<p className="text-gray-500 dark:text-gray-400">
									No status messages found.
								</p>
							)}
						</div>
					</div>

					{/* Right Column - Status Types */}
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
						<h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
							{editingStatusType
								? 'Edit Status Type'
								: 'Create New Status Type'}
						</h2>
						<form
							className="mb-6"
							onSubmit={(e) => {
								e.preventDefault();
								handleCreateOrUpdateStatusType();
							}}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Type
								</label>
								<input
									type="text"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={newStatusType.type}
									onChange={(e) =>
										setNewStatusType({ ...newStatusType, type: e.target.value })
									}
									required
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
									Priority
								</label>
								<select
									className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									value={newStatusType.priority}
									onChange={(e) =>
										setNewStatusType({
											...newStatusType,
											priority: e.target.value,
										})
									}
									required>
									<option value="">Select Priority</option>
									{Array.from({ length: 10 }, (_, i) => i + 1).map(
										(priority) => (
											<option
												key={priority}
												value={priority}>
												{priority}
											</option>
										)
									)}
								</select>
							</div>
							<button
								type="submit"
								className={`w-full py-2 px-4 text-white rounded-md ${
									loading
										? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed'
										: 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800'
								}`}
								disabled={loading}>
								{editingStatusType
									? 'Update Status Type'
									: 'Create Status Type'}
							</button>
						</form>

						<h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
							All Status Types
						</h2>
						<div>
							{statusTypes.length > 0 ? (
								statusTypes.map((type) => (
									<div
										key={type.id}
										className="flex justify-between items-center mb-2 p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-md">
										<div>
											<p className="font-medium text-gray-800 dark:text-gray-200">
												{type.type}
											</p>
											<p className="text-sm text-gray-500 dark:text-gray-400">
												Priority: <span>{type.priority}</span>
											</p>
										</div>
										<div className="flex gap-2">
											<button
												className="px-2 py-1 text-sm text-white bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 rounded-md"
												onClick={() => handleEditStatusType(type)}>
												Edit
											</button>
											<button
												className="px-2 py-1 text-sm text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 rounded-md"
												onClick={() => handleDeleteStatusType(type.id)}>
												Delete
											</button>
										</div>
									</div>
								))
							) : (
								<p className="text-gray-500 dark:text-gray-400">
									No status types found.
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default StatusMsg;
