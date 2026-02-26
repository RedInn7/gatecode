import React from "react";
import CalendarHeatmap from "./CalendarHeatmap";
import TrendingCompanies from "./TrendingCompanies";
import SolvedStatsCard from "./SolvedStatsCard";

const RightSidebar: React.FC = () => {
	return (
		<aside className='space-y-4'>
			<SolvedStatsCard />
			<CalendarHeatmap />
			<TrendingCompanies />
		</aside>
	);
};

export default RightSidebar;
