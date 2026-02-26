import React from "react";
import { TopicAbility } from "@/utils/types/problem";
import { MOCK_TOPIC_ABILITIES } from "@/constants/mockData";

// recharts types are incompatible with @types/react 18.0.x — import as any
// eslint-disable-next-line
const {
	RadarChart,
	Radar,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer,
	Tooltip,
}: any = require("recharts");

type UserAbilityRadarProps = {
	data?: TopicAbility[];
	showStats?: boolean;
};

const CustomTooltip = ({ active, payload }: any) => {
	if (!active || !payload?.[0]) return null;
	const d = payload[0].payload as TopicAbility;
	return (
		<div className="bg-white border border-dark-divider-border-2 rounded-lg shadow-lg px-3 py-2 text-xs">
			<p className="font-medium text-gray-800">{d.topic}</p>
			<p className="text-gray-600">得分: {d.score}</p>
			<p className="text-gray-600">
				已做: {d.solvedProblems}/{d.totalProblems}
			</p>
			<p className="text-gray-600">通过率: {d.passRate}%</p>
		</div>
	);
};

const UserAbilityRadar: React.FC<UserAbilityRadarProps> = ({ data, showStats = false }) => {
	const abilities = data ?? MOCK_TOPIC_ABILITIES;

	return (
		<div>
			<ResponsiveContainer width="100%" height={260}>
				<RadarChart data={abilities} cx="50%" cy="50%" outerRadius="75%">
					<PolarGrid stroke="#e5e7eb" />
					<PolarAngleAxis dataKey="shortLabel" tick={{ fontSize: 12, fill: "#6b7280" }} />
					<PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
					<Tooltip content={<CustomTooltip />} />
					<Radar
						dataKey="score"
						stroke="rgb(255, 161, 22)"
						fill="rgb(255, 161, 22)"
						fillOpacity={0.3}
					/>
				</RadarChart>
			</ResponsiveContainer>

			{showStats && (
				<div className="grid grid-cols-2 gap-2 mt-3 px-2">
					{abilities.map((a) => {
						const pct = a.totalProblems > 0 ? Math.round((a.solvedProblems / a.totalProblems) * 100) : 0;
						const barColor = pct >= 80 ? "bg-dark-green-s" : pct >= 50 ? "bg-dark-yellow" : "bg-dark-pink";

						return (
							<div key={a.topic} className="flex items-center gap-2 text-xs">
								<span className="text-gray-600 w-12 truncate">{a.shortLabel}</span>
								<div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full ${barColor}`}
										style={{ width: `${pct}%` }}
									/>
								</div>
								<span className="text-gray-500 w-8 text-right">{pct}%</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default UserAbilityRadar;
