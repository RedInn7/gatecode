import React, { useEffect, useState } from "react";
import { BackendProblemListItem } from "@/utils/types/problem";
import { auth, firestore } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

const SolvedStatsCard: React.FC = () => {
	const [user] = useAuthState(auth);
	const [solvedSlugs, setSolvedSlugs] = useState<string[]>([]);
	const [allProblems, setAllProblems] = useState<BackendProblemListItem[]>([]);

	// Fetch solved problems from Firestore
	useEffect(() => {
		if (!user) { setSolvedSlugs([]); return; }
		const userRef = doc(firestore, "users", user.uid);
		getDoc(userRef).then((snap) => {
			if (snap.exists()) setSolvedSlugs(snap.data().solvedProblems || []);
		}).catch(() => {});
	}, [user]);

	// Fetch all problems from backend
	useEffect(() => {
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
		const controller = new AbortController();
		fetch(`${backendUrl}/api/v1/problems?page=1&limit=3000`, { signal: controller.signal })
			.then((r) => r.json())
			.then((data) => setAllProblems(data.problems || []))
			.catch(() => {});
		return () => controller.abort();
	}, []);

	const solvedSet = new Set(solvedSlugs);

	const totalEasy = allProblems.filter((p) => p.difficulty === "Easy").length;
	const totalMedium = allProblems.filter((p) => p.difficulty === "Medium").length;
	const totalHard = allProblems.filter((p) => p.difficulty === "Hard").length;

	const solvedEasy = allProblems.filter((p) => p.difficulty === "Easy" && solvedSet.has(p.slug)).length;
	const solvedMedium = allProblems.filter((p) => p.difficulty === "Medium" && solvedSet.has(p.slug)).length;
	const solvedHard = allProblems.filter((p) => p.difficulty === "Hard" && solvedSet.has(p.slug)).length;
	const solvedTotal = solvedEasy + solvedMedium + solvedHard;
	const total = allProblems.length;

	// Circular progress
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const progress = total > 0 ? solvedTotal / total : 0;
	const offset = circumference - progress * circumference;

	const bars = [
		{ label: "Easy", solved: solvedEasy, total: totalEasy, color: "bg-dark-green-s", textColor: "text-dark-green-s" },
		{ label: "Medium", solved: solvedMedium, total: totalMedium, color: "bg-dark-yellow", textColor: "text-dark-yellow" },
		{ label: "Hard", solved: solvedHard, total: totalHard, color: "bg-dark-pink", textColor: "text-dark-pink" },
	];

	return (
		<div className='bg-white rounded-lg border border-gray-200 p-4'>
			<div className='flex items-center gap-6'>
				{/* Circular chart */}
				<div className='relative flex-shrink-0'>
					<svg width={100} height={100} className='-rotate-90'>
						<circle cx={50} cy={50} r={radius} fill='none' stroke='#e5e7eb' strokeWidth={6} />
						<circle
							cx={50} cy={50} r={radius} fill='none'
							stroke='rgb(255, 161, 22)' strokeWidth={6}
							strokeDasharray={circumference} strokeDashoffset={offset}
							strokeLinecap='round'
						/>
					</svg>
					<div className='absolute inset-0 flex flex-col items-center justify-center'>
						<span className='text-lg font-bold text-gray-800'>{solvedTotal}</span>
						<span className='text-[10px] text-gray-400'>/{total} Solved</span>
					</div>
				</div>

				{/* Bars */}
				<div className='flex-1 space-y-2.5'>
					{bars.map((bar) => (
						<div key={bar.label}>
							<div className='flex items-center justify-between mb-0.5'>
								<span className={`text-xs font-medium ${bar.textColor}`}>{bar.label}</span>
								<span className='text-xs text-gray-500'>
									{bar.solved}/{bar.total}
								</span>
							</div>
							<div className='h-1.5 bg-gray-100 rounded-full overflow-hidden'>
								<div
									className={`h-full rounded-full ${bar.color} transition-all`}
									style={{ width: bar.total > 0 ? `${(bar.solved / bar.total) * 100}%` : "0%" }}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default SolvedStatsCard;
