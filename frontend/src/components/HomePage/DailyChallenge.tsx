import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BackendProblemListItem } from "@/utils/types/problem";

const DailyChallenge: React.FC = () => {
	const [problem, setProblem] = useState<BackendProblemListItem | null>(null);

	useEffect(() => {
		// Pick a deterministic "daily" problem based on today's date
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
		const controller = new AbortController();
		fetch(`${backendUrl}/api/v1/problems?page=1&limit=3000`, { signal: controller.signal })
			.then((r) => r.json())
			.then((data) => {
				const problems: BackendProblemListItem[] = data.problems || [];
				if (problems.length === 0) return;
				// Deterministic daily pick based on date
				const today = new Date();
				const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
				const idx = ((seed * 2654435761) >>> 0) % problems.length;
				setProblem(problems[idx]);
			})
			.catch(() => {});
		return () => controller.abort();
	}, []);

	if (!problem) return null;

	const diffColor =
		problem.difficulty === "Easy"
			? "text-dark-green-s"
			: problem.difficulty === "Medium"
			? "text-dark-yellow"
			: "text-dark-pink";
	const diffBg =
		problem.difficulty === "Easy"
			? "bg-green-50"
			: problem.difficulty === "Medium"
			? "bg-yellow-50"
			: "bg-red-50";

	const today = new Date();
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	return (
		<div className='bg-white rounded-lg border border-gray-200 p-4'>
			<div className='flex items-center justify-between mb-3'>
				<div className='flex items-center gap-2'>
					<div className='w-10 h-10 rounded-lg bg-brand-orange/10 flex flex-col items-center justify-center'>
						<span className='text-[10px] text-brand-orange font-medium leading-none'>
							{monthNames[today.getMonth()]}
						</span>
						<span className='text-sm text-brand-orange font-bold leading-none'>
							{today.getDate()}
						</span>
					</div>
					<div>
						<h3 className='text-xs font-semibold text-gray-500 uppercase'>Daily Challenge</h3>
					</div>
				</div>
				<span className={`text-xs px-2 py-0.5 rounded font-medium ${diffColor} ${diffBg}`}>
					{problem.difficulty}
				</span>
			</div>

			<Link
				href={`/problems/${problem.slug}`}
				className='block text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors mb-3'
			>
				{problem.frontend_question_id}. {problem.title}
			</Link>

			<Link
				href={`/problems/${problem.slug}`}
				className='inline-block text-xs font-medium text-white bg-brand-orange hover:bg-brand-orange-s px-4 py-1.5 rounded-lg transition-colors'
			>
				Solve Challenge
			</Link>
		</div>
	);
};

export default DailyChallenge;
