import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BsChevronRight, BsLock, BsCheckCircle } from "react-icons/bs";
import { Module } from "@/utils/types/problem";
import { MOCK_CURRICULUM } from "@/constants/mockData";

type GroupedProblemTableProps = {
	modules?: Module[];
	solvedSlugs?: string[];
	isVip?: boolean;
};

const difficultyColor: Record<string, string> = {
	Easy: "text-dark-green-s",
	Medium: "text-dark-yellow",
	Hard: "text-dark-pink",
};

const GroupedProblemTable: React.FC<GroupedProblemTableProps> = ({
	modules,
	solvedSlugs = [],
	isVip = false,
}) => {
	const data = modules ?? MOCK_CURRICULUM;
	const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
	const [expandedSubModules, setExpandedSubModules] = useState<Set<string>>(new Set());

	const solvedSet = useMemo(() => new Set(solvedSlugs), [solvedSlugs]);

	const toggleModule = (id: string) => {
		setExpandedModules((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleSubModule = (id: string) => {
		setExpandedSubModules((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<div className="w-full">
			{data.map((mod) => {
				const modExpanded = expandedModules.has(mod.id);
				const totalProblems = mod.subModules.reduce((acc, sm) => acc + sm.problems.length, 0);
				const solvedCount = mod.subModules.reduce(
					(acc, sm) => acc + sm.problems.filter((p) => solvedSet.has(p.slug)).length,
					0
				);
				const modLocked = mod.is_vip_only && !isVip;

				return (
					<div key={mod.id} className="mb-2">
						{/* Module row */}
						<button
							onClick={() => toggleModule(mod.id)}
							className="w-full flex items-center gap-3 px-4 py-3 bg-dark-layer-1 hover:bg-dark-fill-3 rounded-lg transition-colors"
						>
							<BsChevronRight
								className={`text-gray-400 transition-transform ${modExpanded ? "rotate-90" : ""}`}
							/>
							<span className="font-medium text-gray-800 flex-1 text-left">{mod.title}</span>
							{modLocked && <BsLock className="text-gray-400" />}
							{/* Progress bar */}
							<div className="flex items-center gap-2">
								<div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-dark-green-s rounded-full transition-all"
										style={{ width: `${totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0}%` }}
									/>
								</div>
								<span className="text-xs text-gray-500 w-10 text-right">
									{solvedCount}/{totalProblems}
								</span>
							</div>
						</button>

						{/* SubModules */}
						{modExpanded && (
							<div className="mt-1">
								{mod.subModules.map((sm) => {
									const smExpanded = expandedSubModules.has(sm.id);
									const smSolved = sm.problems.filter((p) => solvedSet.has(p.slug)).length;
									const smLocked = (mod.is_vip_only || sm.is_vip_only) && !isVip;

									return (
										<div key={sm.id} className="ml-4">
											{/* SubModule row */}
											<button
												onClick={() => toggleSubModule(sm.id)}
												className="w-full flex items-center gap-3 pl-8 pr-4 py-2.5 hover:bg-dark-fill-3 rounded transition-colors"
											>
												<BsChevronRight
													className={`text-gray-400 text-xs transition-transform ${smExpanded ? "rotate-90" : ""}`}
												/>
												<span className="text-sm text-gray-700 flex-1 text-left">{sm.title}</span>
												{smLocked && <BsLock className="text-gray-400 text-xs" />}
												<span className="text-xs text-gray-400">
													{smSolved}/{sm.problems.length}
												</span>
											</button>

											{/* Problem rows */}
											{smExpanded && (
												<div className="mt-0.5">
													{sm.problems.map((prob, idx) => {
														const isSolved = solvedSet.has(prob.slug);
														const probLocked = (smLocked || prob.is_vip_only) && !isVip;

														return (
															<div
																key={prob.slug}
																className={`flex items-center gap-3 pl-16 pr-4 py-2 ${
																	idx % 2 === 0 ? "bg-dark-fill-3/50" : ""
																} hover:bg-dark-fill-2 transition-colors`}
															>
																<span className="w-5 text-center">
																	{isSolved && (
																		<BsCheckCircle className="text-dark-green-s text-sm" />
																	)}
																</span>
																{probLocked ? (
																	<span className="text-sm text-gray-400 flex-1 flex items-center gap-2 pointer-events-none opacity-50">
																		#{prob.id}. {prob.title}
																		<BsLock className="text-xs" />
																	</span>
																) : (
																	<Link
																		href={`/problems/${prob.slug}`}
																		className="text-sm text-gray-800 hover:text-blue-600 flex-1"
																	>
																		#{prob.id}. {prob.title}
																	</Link>
																)}
																<span className={`text-xs ${difficultyColor[prob.difficulty] ?? "text-gray-500"}`}>
																	{prob.difficulty}
																</span>
															</div>
														);
													})}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default GroupedProblemTable;
