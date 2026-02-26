import React from "react";
import { useRouter } from "next/router";
import { FiSearch, FiShuffle } from "react-icons/fi";
import { BiSort } from "react-icons/bi";
import { SortOption } from "@/utils/types/homepage";

type ProblemSearchBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	sort: SortOption;
	onSortChange: (sort: SortOption) => void;
	solvedCount: number;
	totalCount: number;
	difficultyFilter: string[];
	onDifficultyFilterChange: (filter: string[]) => void;
	statusFilter: string;
	onStatusFilterChange: (status: string) => void;
	problemSlugs?: string[];
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
	{ value: "default", label: "Default" },
	{ value: "frontend_id", label: "# ID" },
	{ value: "acceptance", label: "Acceptance" },
	{ value: "difficulty", label: "Difficulty" },
	{ value: "frequency", label: "Frequency" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["All", "Todo", "Solved", "Attempted"];

const ProblemSearchBar: React.FC<ProblemSearchBarProps> = ({
	search,
	onSearchChange,
	sort,
	onSortChange,
	solvedCount,
	totalCount,
	difficultyFilter,
	onDifficultyFilterChange,
	statusFilter,
	onStatusFilterChange,
	problemSlugs = [],
}) => {
	const [showSortMenu, setShowSortMenu] = React.useState(false);
	const router = useRouter();

	const toggleDifficulty = (diff: string) => {
		if (difficultyFilter.includes(diff)) {
			onDifficultyFilterChange(difficultyFilter.filter((d) => d !== diff));
		} else {
			onDifficultyFilterChange([...difficultyFilter, diff]);
		}
	};

	const handlePickOne = () => {
		if (problemSlugs.length === 0) return;
		const idx = Math.floor(Math.random() * problemSlugs.length);
		router.push(`/problems/${problemSlugs[idx]}`);
	};

	return (
		<div className='space-y-3'>
			{/* Row 1: Search + Sort + Pick One */}
			<div className='flex items-center gap-2'>
				{/* Search */}
				<div className='flex-1 relative'>
					<FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={14} />
					<input
						type='text'
						placeholder='Search questions...'
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						className='w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30 text-gray-700 placeholder-gray-400'
					/>
				</div>

				{/* Sort */}
				<div className='relative'>
					<button
						onClick={() => setShowSortMenu(!showSortMenu)}
						className='flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
					>
						<BiSort size={14} />
						<span className='hidden sm:inline'>Sort</span>
					</button>
					{showSortMenu && (
						<>
							<div className='fixed inset-0 z-10' onClick={() => setShowSortMenu(false)} />
							<div className='absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1'>
								{SORT_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										onClick={() => { onSortChange(opt.value); setShowSortMenu(false); }}
										className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
											sort === opt.value ? "bg-brand-orange/10 text-brand-orange" : "text-gray-600 hover:bg-gray-50"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</>
					)}
				</div>

				{/* Pick One */}
				<button
					onClick={handlePickOne}
					className='flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-brand-orange hover:bg-brand-orange-s rounded-lg transition-colors'
					title='Pick a random problem'
				>
					<FiShuffle size={14} />
					<span className='hidden sm:inline'>Pick One</span>
				</button>
			</div>

			{/* Row 2: Difficulty pills + Status pills + Solved count */}
			<div className='flex items-center gap-4 flex-wrap'>
				{/* Difficulty */}
				<div className='flex items-center gap-1'>
					{DIFFICULTIES.map((diff) => {
						const active = difficultyFilter.includes(diff);
						const color =
							diff === "Easy" ? "text-dark-green-s border-dark-green-s bg-green-50"
							: diff === "Medium" ? "text-dark-yellow border-dark-yellow bg-yellow-50"
							: "text-dark-pink border-dark-pink bg-red-50";
						const inactive = "text-gray-500 border-gray-200 bg-white hover:bg-gray-50";
						return (
							<button
								key={diff}
								onClick={() => toggleDifficulty(diff)}
								className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${active ? color : inactive}`}
							>
								{diff}
							</button>
						);
					})}
				</div>

				{/* Separator */}
				<div className='h-4 w-px bg-gray-200' />

				{/* Status */}
				<div className='flex items-center gap-1'>
					{STATUSES.map((s) => (
						<button
							key={s}
							onClick={() => onStatusFilterChange(s)}
							className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
								statusFilter === s
									? "bg-gray-800 text-white"
									: "text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"
							}`}
						>
							{s}
						</button>
					))}
				</div>

				{/* Solved count */}
				<div className='ml-auto text-xs text-gray-500'>
					<span className='font-medium text-brand-orange'>{solvedCount}</span>
					<span>/{totalCount} Solved</span>
				</div>
			</div>
		</div>
	);
};

export default ProblemSearchBar;
