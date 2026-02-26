import React, { useMemo } from "react";
import { MOCK_CALENDAR_DATA } from "@/constants/homepageMockData";

const INTENSITY_COLORS = [
	"bg-gray-100",       // 0
	"bg-green-200",      // 1
	"bg-green-400",      // 2
	"bg-green-500",      // 3
	"bg-green-700",      // 4
];

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const CalendarHeatmap: React.FC = () => {
	const { weeks, totalSubmissions, currentStreak } = useMemo(() => {
		const data = MOCK_CALENDAR_DATA;
		const today = new Date();

		// Build a map: "YYYY-MM-DD" → count
		const map = new Map<string, number>();
		data.forEach((d) => map.set(d.date, d.count));

		// Build weeks grid (last ~52 weeks from today)
		const weeks: { date: string; count: number }[][] = [];
		const endDate = new Date(today);
		// Go back to the last Sunday before 52*7 days ago
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - 52 * 7 - startDate.getDay());

		let currentWeek: { date: string; count: number }[] = [];
		const cursor = new Date(startDate);

		while (cursor <= endDate) {
			const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
			currentWeek.push({ date: key, count: map.get(key) ?? 0 });
			if (currentWeek.length === 7) {
				weeks.push(currentWeek);
				currentWeek = [];
			}
			cursor.setDate(cursor.getDate() + 1);
		}
		if (currentWeek.length > 0) weeks.push(currentWeek);

		// Stats
		const totalSubmissions = data.reduce((sum, d) => sum + d.count, 0);

		// Current streak
		let streak = 0;
		const d = new Date(today);
		while (true) {
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
			if ((map.get(key) ?? 0) > 0) {
				streak++;
				d.setDate(d.getDate() - 1);
			} else {
				break;
			}
		}

		return { weeks, totalSubmissions, currentStreak: streak };
	}, []);

	return (
		<div className='bg-white rounded-lg border border-gray-200 p-4'>
			{/* Header */}
			<div className='flex items-center justify-between mb-3'>
				<div>
					<span className='text-sm font-semibold text-gray-800'>
						{totalSubmissions}
					</span>
					<span className='text-xs text-gray-500 ml-1'>submissions in the past year</span>
				</div>
			</div>

			{/* Streak */}
			<div className='flex gap-4 mb-3 text-xs text-gray-500'>
				<span>
					Current Streak: <b className='text-gray-800'>{currentStreak}</b> days
				</span>
			</div>

			{/* Grid */}
			<div className='flex gap-[2px] overflow-x-auto scrollbar-hide'>
				{/* Weekday labels */}
				<div className='flex flex-col gap-[2px] mr-1'>
					{WEEKDAY_LABELS.map((label, i) => (
						<div key={i} className='w-[10px] h-[10px] text-[8px] text-gray-400 flex items-center'>
							{label}
						</div>
					))}
				</div>

				{/* Week columns */}
				{weeks.map((week, wi) => (
					<div key={wi} className='flex flex-col gap-[2px]'>
						{week.map((day, di) => (
							<div
								key={di}
								className={`w-[10px] h-[10px] rounded-sm ${INTENSITY_COLORS[day.count]} transition-colors`}
								title={`${day.date}: ${day.count} submissions`}
							/>
						))}
					</div>
				))}
			</div>

			{/* Legend */}
			<div className='flex items-center gap-1 mt-2 justify-end'>
				<span className='text-[10px] text-gray-400 mr-1'>Less</span>
				{INTENSITY_COLORS.map((color, i) => (
					<div key={i} className={`w-[10px] h-[10px] rounded-sm ${color}`} />
				))}
				<span className='text-[10px] text-gray-400 ml-1'>More</span>
			</div>
		</div>
	);
};

export default CalendarHeatmap;
