import Entry from './Entry';

function DayColumn({ date, entries }) {
	const day = new Date(date);
	const dayName = day.toLocaleString('default', { weekday: 'short' });
	const dayNumber = day.getDate();

	return (
		<div className="border border-gray-700 p-3 rounded-lg bg-gray-900 text-white min-h-[150px] min-w-[100px]">
			<div className="text-center font-bold mb-2">
				{dayName} <br /> {dayNumber}
			</div>
			<div className="space-y-2">
				{entries.length > 0 ? (
					entries.map((entry, index) => (
						<Entry
							key={index}
							entry={entry}
						/>
					))
				) : (
					<div className="text-gray-500 text-sm">No entries</div>
				)}
			</div>
		</div>
	);
}

export default DayColumn;
