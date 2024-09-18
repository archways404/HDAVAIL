function Entry({ entry }) {
	return (
		<div className="bg-blue-700 text-white p-3 text-center rounded-lg shadow-md">
			<div className="font-semibold">{entry.location}</div>
			<div className="text-sm">
				{entry.start_time} - {entry.end_time}
			</div>
			<div className="text-sm">{entry.moment}</div>
		</div>
	);
}

export default Entry;
