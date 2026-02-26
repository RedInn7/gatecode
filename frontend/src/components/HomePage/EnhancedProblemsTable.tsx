import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { BackendProblemListItem } from "@/utils/types/problem";
import { SortOption } from "@/utils/types/homepage";
import { enrichProblemWithMockData } from "@/constants/homepageMockData";
import { useAuthState } from "react-firebase-hooks/auth";

const PAGE_LIMIT = 100;

type TopicTagsMap = Record<string, string[]>;

type EnhancedProblemsTableProps = {
	search: string;
	sort: SortOption;
	difficultyFilter: string[];
	statusFilter: string;
	selectedTopicTag: string | null;
	onStatsUpdate: (solved: number, total: number) => void;
	onSlugsUpdate?: (slugs: string[]) => void;
};

type EnrichedProblem = BackendProblemListItem & {
	acceptance: number;
	frequency: number;
};

const TAG_DISPLAY_NAMES: Record<string, string> = {
	"array": "Array", "string": "String", "hash-table": "Hash Table",
	"dynamic-programming": "DP", "math": "Math", "sorting": "Sorting",
	"greedy": "Greedy", "depth-first-search": "DFS", "binary-search": "Binary Search",
	"breadth-first-search": "BFS", "tree": "Tree", "matrix": "Matrix",
	"two-pointers": "Two Pointers", "bit-manipulation": "Bit", "stack": "Stack",
	"heap": "Heap", "graph": "Graph", "design": "Design", "linked-list": "Linked List",
	"backtracking": "Backtrack", "simulation": "Simulation", "sliding-window": "Sliding Window",
	"union-find": "Union Find", "divide-and-conquer": "D&C", "trie": "Trie",
	"recursion": "Recursion", "database": "SQL",
};

const EnhancedProblemsTable: React.FC<EnhancedProblemsTableProps> = ({
	search,
	sort,
	difficultyFilter,
	statusFilter,
	selectedTopicTag,
	onStatsUpdate,
	onSlugsUpdate,
}) => {
	const { problems, hasMore, isFetchingMore, loadMore, loading } = useGetProblems();
	const solvedProblems = useGetSolvedProblems();
	const solvedSet = new Set(solvedProblems);
	const topicTags = useTopicTags();

	// Enrich with mock data
	const enriched: EnrichedProblem[] = problems.map((p) => ({
		...p,
		...enrichProblemWithMockData(p.id),
	}));

	// Filter
	const filtered = enriched.filter((p) => {
		// Search
		if (search) {
			const q = search.toLowerCase();
			if (!p.title.toLowerCase().includes(q) && !String(p.frontend_question_id).includes(q)) return false;
		}
		// Difficulty
		if (difficultyFilter.length > 0 && !difficultyFilter.includes(p.difficulty)) return false;
		// Status
		if (statusFilter === "Solved" && !solvedSet.has(p.slug)) return false;
		if (statusFilter === "Todo" && solvedSet.has(p.slug)) return false;
		// Topic tag filter
		if (selectedTopicTag) {
			const tags = topicTags[p.slug];
			if (!tags || !tags.includes(selectedTopicTag)) return false;
		}
		return true;
	});

	// Sort
	const sorted = [...filtered].sort((a, b) => {
		switch (sort) {
			case "frontend_id":
				return a.frontend_question_id - b.frontend_question_id;
			case "acceptance":
				return b.acceptance - a.acceptance;
			case "difficulty": {
				const order = { Easy: 0, Medium: 1, Hard: 2 };
				return (order[a.difficulty as keyof typeof order] ?? 1) - (order[b.difficulty as keyof typeof order] ?? 1);
			}
			case "frequency":
				return b.frequency - a.frequency;
			default:
				return 0;
		}
	});

	// Report stats + slugs
	useEffect(() => {
		onStatsUpdate(solvedProblems.length, problems.length);
	}, [solvedProblems.length, problems.length, onStatsUpdate]);

	useEffect(() => {
		onSlugsUpdate?.(sorted.map((p) => p.slug));
	}, [sorted.length, onSlugsUpdate]);

	// Infinite scroll sentinel
	const sentinelRef = useRef<HTMLTableRowElement>(null);
	const loadMoreRef = useRef(loadMore);
	useEffect(() => { loadMoreRef.current = loadMore; }, [loadMore]);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) loadMoreRef.current(); },
			{ rootMargin: "300px" }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	if (loading) {
		return (
			<div className='w-full animate-pulse space-y-3 p-4'>
				{[...Array(10)].map((_, idx) => (
					<div key={idx} className='flex items-center space-x-4'>
						<div className='w-5 h-5 rounded-full bg-gray-200' />
						<div className='h-4 w-16 rounded bg-gray-200' />
						<div className='h-4 flex-1 rounded bg-gray-200' />
						<div className='h-4 w-20 rounded bg-gray-200' />
						<div className='h-4 w-16 rounded bg-gray-200' />
					</div>
				))}
			</div>
		);
	}

	return (
		<div className='overflow-x-auto'>
			<table className='text-sm text-left w-full'>
				<thead>
					<tr className='text-xs text-gray-500 border-b border-gray-200'>
						<th className='px-3 py-3 font-medium w-10'>Status</th>
						<th className='px-3 py-3 font-medium'>Title</th>
						<th className='px-3 py-3 font-medium w-24 text-right'>Acceptance</th>
						<th className='px-3 py-3 font-medium w-20'>Difficulty</th>
						<th className='px-3 py-3 font-medium w-28'>Frequency</th>
					</tr>
				</thead>
				<tbody>
					{sorted.map((problem, idx) => {
						const isSolved = solvedSet.has(problem.slug);
						const diffColor =
							problem.difficulty === "Easy" ? "text-dark-green-s"
							: problem.difficulty === "Medium" ? "text-dark-yellow"
							: "text-dark-pink";
						const diffBg =
							problem.difficulty === "Easy" ? "bg-green-50"
							: problem.difficulty === "Medium" ? "bg-yellow-50"
							: "bg-red-50";

						return (
							<tr
								key={problem.id}
								className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
									idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
								}`}
							>
								<td className='px-3 py-3'>
									{isSolved && <BsCheckCircle className='text-dark-green-s' size={16} />}
								</td>
								<td className='px-3 py-3'>
									<div className='flex items-center flex-wrap gap-1'>
										<Link href={`/problems/${problem.slug}`} className='text-gray-800 hover:text-blue-600 transition-colors'>
											<span className='text-gray-400 mr-1.5'>{problem.frontend_question_id}.</span>
											{problem.title}
											{problem.is_vip_only && (
												<span className='ml-2 text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded'>Premium</span>
											)}
										</Link>
										{topicTags[problem.slug]?.slice(0, 3).map((tag) => (
											<span key={tag} className='text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded whitespace-nowrap'>
												{TAG_DISPLAY_NAMES[tag] || tag}
											</span>
										))}
									</div>
								</td>
								<td className='px-3 py-3 text-right text-gray-600 text-xs'>{problem.acceptance}%</td>
								<td className='px-3 py-3'>
									<span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${diffColor} ${diffBg}`}>
										{problem.difficulty}
									</span>
								</td>
								<td className='px-3 py-3'>
									<div className='w-full bg-gray-100 rounded-full h-1.5'>
										<div className='bg-brand-orange h-1.5 rounded-full transition-all' style={{ width: `${problem.frequency * 100}%` }} />
									</div>
								</td>
							</tr>
						);
					})}

					{isFetchingMore && (
						<tr><td colSpan={5} className='text-center py-4 text-gray-500 text-sm'>Loading...</td></tr>
					)}
					{!hasMore && sorted.length > 0 && (
						<tr><td colSpan={5} className='text-center py-4 text-gray-400 text-xs'>All {problems.length} problems loaded</td></tr>
					)}
					{sorted.length === 0 && !loading && (
						<tr><td colSpan={5} className='text-center py-8 text-gray-400 text-sm'>No problems match your filters</td></tr>
					)}
					<tr ref={sentinelRef}><td colSpan={5} className='h-1' /></tr>
				</tbody>
			</table>
		</div>
	);
};

export default EnhancedProblemsTable;

// === Hooks ===

function useGetProblems() {
	const [problems, setProblems] = useState<BackendProblemListItem[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [loading, setLoading] = useState(true);
	const isFetching = useRef(false);
	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

	const fetchPage = useCallback(
		async (pageNum: number) => {
			if (isFetching.current) return;
			isFetching.current = true;
			const isFirst = pageNum === 1;
			if (isFirst) setLoading(true); else setIsFetchingMore(true);

			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), 2000);
			try {
				const res = await fetch(
					`${backendUrl}/api/v1/problems?page=${pageNum}&limit=${PAGE_LIMIT}`,
					{ signal: controller.signal }
				);
				clearTimeout(timer);
				if (!res.ok) throw new Error("Failed to fetch");
				const data: { total: number; problems: BackendProblemListItem[] } = await res.json();
				const incoming = data.problems ?? [];
				setProblems((prev) => (isFirst ? incoming : [...prev, ...incoming]));
				setHasMore(pageNum * PAGE_LIMIT < (data.total ?? 0));
			} catch {
				// fail silently
			} finally {
				if (isFirst) setLoading(false); else setIsFetchingMore(false);
				isFetching.current = false;
			}
		},
		[backendUrl]
	);

	useEffect(() => { fetchPage(1); }, [fetchPage]);

	const loadMore = useCallback(() => {
		if (!hasMore || isFetching.current) return;
		const next = page + 1;
		setPage(next);
		fetchPage(next);
	}, [hasMore, page, fetchPage]);

	return { problems, hasMore, isFetchingMore, loadMore, loading };
}

function useGetSolvedProblems() {
	const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
	const [user] = useAuthState(auth);

	useEffect(() => {
		if (!user) { setSolvedProblems([]); return; }
		const userRef = doc(firestore, "users", user.uid);
		getDoc(userRef).then((snap) => {
			if (snap.exists()) setSolvedProblems(snap.data().solvedProblems || []);
		}).catch(() => {});
	}, [user]);

	return solvedProblems;
}

function useTopicTags(): TopicTagsMap {
	const [tags, setTags] = useState<TopicTagsMap>({});

	useEffect(() => {
		fetch("/data/problem-topic-tags.json")
			.then((r) => r.json())
			.then((data: TopicTagsMap) => setTags(data))
			.catch(() => {});
	}, []);

	return tags;
}
