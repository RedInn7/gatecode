import React, { useState } from "react";
import Link from "next/link";
import { STUDY_PLANS } from "@/constants/leetcodeScrapedData";
import { IoArrowBack } from "react-icons/io5";

type StudyPlanDetailProps = {
	planSlug: string;
	onBack: () => void;
};

const StudyPlanDetail: React.FC<StudyPlanDetailProps> = ({ planSlug, onBack }) => {
	const plan = STUDY_PLANS[planSlug];
	const [expandedGroup, setExpandedGroup] = useState<string | null>(
		plan?.groups[0]?.slug || null
	);

	if (!plan) {
		return (
			<div className='text-center text-gray-400 py-8 text-sm'>
				Study plan not found
			</div>
		);
	}

	const totalProblems = plan.groups.reduce((s, g) => s + g.problems.length, 0);

	return (
		<div>
			{/* Header */}
			<div className='flex items-center gap-3 mb-4'>
				<button
					onClick={onBack}
					className='p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors'
				>
					<IoArrowBack size={18} />
				</button>
				<div>
					<h2 className='text-lg font-semibold text-gray-800'>{plan.name}</h2>
					<p className='text-xs text-gray-500'>
						{plan.groups.length} sections · {totalProblems} problems
					</p>
				</div>
			</div>

			{/* Groups */}
			<div className='space-y-2'>
				{plan.groups.map((group) => {
					const isExpanded = expandedGroup === group.slug;
					return (
						<div
							key={group.slug}
							className='bg-white rounded-lg border border-gray-200 overflow-hidden'
						>
							{/* Group header */}
							<button
								onClick={() =>
									setExpandedGroup(isExpanded ? null : group.slug)
								}
								className='w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left'
							>
								<span className='text-sm font-medium text-gray-800'>
									{group.name}
								</span>
								<span className='text-xs text-gray-400'>
									{group.problems.length} problems
								</span>
							</button>

							{/* Problem list */}
							{isExpanded && (
								<div className='border-t border-gray-100'>
									{group.problems.map((problem, idx) => {
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

										return (
											<Link
												key={problem.slug}
												href={`/problems/${problem.slug}`}
												className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm ${
													idx % 2 === 0 ? "" : "bg-gray-50/50"
												}`}
											>
												<span className='text-gray-400 w-8 text-right shrink-0 text-xs'>
													{problem.id}
												</span>
												<span className='text-gray-700 hover:text-blue-600 flex-1 truncate'>
													{problem.title}
													{problem.paidOnly && (
														<span className='ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded'>
															Premium
														</span>
													)}
												</span>
												<span
													className={`text-xs px-2 py-0.5 rounded ${diffColor} ${diffBg}`}
												>
													{problem.difficulty}
												</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default StudyPlanDetail;
