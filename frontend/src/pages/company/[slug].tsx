import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Topbar from "@/components/Topbar/Topbar";
import CompanyLogo from "@/components/CompanyLogo";
import { COMPANY_TAGS, type CompanyProblem } from "@/constants/leetcodeScrapedData";
import { FiSearch } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

export default function CompanyPage() {
	const router = useRouter();
	const slug = router.query.slug as string | undefined;

	const [problems, setProblems] = useState<CompanyProblem[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [diffFilter, setDiffFilter] = useState<DifficultyFilter>("All");

	const company = COMPANY_TAGS.find((c) => c.slug === slug);

	// Load company problems on demand from static JSON
	useEffect(() => {
		if (!slug) return;
		setLoading(true);
		fetch("/data/company-problems.json")
			.then((r) => r.json())
			.then((data: Record<string, CompanyProblem[]>) => {
				setProblems(data[slug] || []);
			})
			.catch(() => setProblems([]))
			.finally(() => setLoading(false));
	}, [slug]);

	// Filter + search + sort by frequency desc
	const filtered = problems
		.filter((p) => {
			if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
			if (search) {
				const q = search.toLowerCase();
				return p.title.toLowerCase().includes(q) || String(p.id).includes(q);
			}
			return true;
		})
		.sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0));

	// Difficulty stats
	const easy = problems.filter((p) => p.difficulty === "Easy").length;
	const medium = problems.filter((p) => p.difficulty === "Medium").length;
	const hard = problems.filter((p) => p.difficulty === "Hard").length;

	return (
		<main className='bg-dark-layer-2 min-h-screen'>
			<Topbar />
			<div className='max-w-[900px] mx-auto px-4 py-6'>
				{/* Header */}
				<div className='flex items-center gap-3 mb-6'>
					<Link
						href='/'
						className='p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors'
					>
						<IoArrowBack size={18} />
					</Link>
					{slug && <CompanyLogo slug={slug} name={company?.name || slug} size={40} />}
					<div>
						<h1 className='text-xl font-bold text-gray-800'>
							{company?.name || slug}
						</h1>
						<p className='text-sm text-gray-500'>
							{problems.length} problems tagged
						</p>
					</div>
				</div>

				{/* Difficulty stats */}
				{!loading && (
					<div className='flex gap-3 mb-4'>
						{(
							[
								{ label: "All", count: problems.length, color: "text-gray-700", bg: "bg-gray-100" },
								{ label: "Easy", count: easy, color: "text-dark-green-s", bg: "bg-green-50" },
								{ label: "Medium", count: medium, color: "text-dark-yellow", bg: "bg-yellow-50" },
								{ label: "Hard", count: hard, color: "text-dark-pink", bg: "bg-red-50" },
							] as const
						).map(({ label, count, color, bg }) => (
							<button
								key={label}
								onClick={() => setDiffFilter(label as DifficultyFilter)}
								className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
									diffFilter === label
										? `${bg} ${color} border-current`
										: "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
								}`}
							>
								{label} <span className='ml-1 opacity-60'>{count}</span>
							</button>
						))}
					</div>
				)}

				{/* Search */}
				<div className='relative mb-4'>
					<FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={14} />
					<input
						type='text'
						placeholder='Search problems...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 text-gray-700 placeholder-gray-400'
					/>
				</div>

				{/* Table */}
				<div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
					{loading ? (
						<div className='animate-pulse space-y-3 p-4'>
							{[...Array(10)].map((_, i) => (
								<div key={i} className='flex gap-4'>
									<div className='h-4 w-10 bg-gray-200 rounded' />
									<div className='h-4 flex-1 bg-gray-200 rounded' />
									<div className='h-4 w-16 bg-gray-200 rounded' />
								</div>
							))}
						</div>
					) : (
						<table className='text-sm text-left w-full'>
							<thead>
								<tr className='text-xs text-gray-500 border-b border-gray-200'>
									<th className='px-4 py-3 font-medium w-16'>#</th>
									<th className='px-4 py-3 font-medium'>Title</th>
									<th className='px-4 py-3 font-medium w-24 text-right'>Difficulty</th>
									<th className='px-4 py-3 font-medium w-28'>Frequency</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((problem, idx) => {
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
										<tr
											key={problem.id}
											className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
												idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
											}`}
										>
											<td className='px-4 py-3 text-gray-400'>{problem.id}</td>
											<td className='px-4 py-3'>
												<Link
													href={`/problems/${problem.slug}`}
													className='text-gray-800 hover:text-blue-600 transition-colors'
												>
													{problem.title}
													{problem.paidOnly && (
														<span className='ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded'>
															Premium
														</span>
													)}
												</Link>
											</td>
											<td className='px-4 py-3 text-right'>
												<span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${diffColor} ${diffBg}`}>
													{problem.difficulty}
												</span>
											</td>
											<td className='px-4 py-3'>
												{problem.frequency != null && problem.frequency > 0 ? (
													<div className='flex items-center gap-2'>
														<div className='w-full bg-gray-100 rounded-full h-1.5'>
															<div className='bg-brand-orange h-1.5 rounded-full transition-all' style={{ width: `${Math.min(problem.frequency, 100)}%` }} />
														</div>
														<span className='text-[10px] text-gray-400 w-8 text-right'>{problem.frequency.toFixed(0)}%</span>
													</div>
												) : (
													<span className='text-[10px] text-gray-300'>-</span>
												)}
											</td>
										</tr>
									);
								})}
								{filtered.length === 0 && (
									<tr>
										<td colSpan={4} className='text-center py-8 text-gray-400 text-sm'>
											No problems found
										</td>
									</tr>
								)}
							</tbody>
						</table>
					)}
				</div>

				{/* Count */}
				{!loading && filtered.length > 0 && (
					<p className='text-xs text-gray-400 mt-3 text-center'>
						Showing {filtered.length} of {problems.length} problems
					</p>
				)}
			</div>
		</main>
	);
}
