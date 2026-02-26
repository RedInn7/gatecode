import {
	TopicTagWithCount,
	BannerCard,
	TrendingCompany,
	CalendarDay,
	StudyPlanItem,
} from "@/utils/types/homepage";

export const MOCK_TOPIC_TAGS_WITH_COUNT: TopicTagWithCount[] = [
	{ slug: "array", name: "Array", count: 2099 },
	{ slug: "string", name: "String", count: 852 },
	{ slug: "hash-table", name: "Hash Table", count: 698 },
	{ slug: "dynamic-programming", name: "Dynamic Programming", count: 586 },
	{ slug: "math", name: "Math", count: 583 },
	{ slug: "sorting", name: "Sorting", count: 440 },
	{ slug: "greedy", name: "Greedy", count: 406 },
	{ slug: "depth-first-search", name: "Depth-First Search", count: 340 },
	{ slug: "binary-search", name: "Binary Search", count: 316 },
	{ slug: "database", name: "Database", count: 311 },
	{ slug: "breadth-first-search", name: "Breadth-First Search", count: 268 },
	{ slug: "tree", name: "Tree", count: 261 },
	{ slug: "matrix", name: "Matrix", count: 225 },
	{ slug: "two-pointers", name: "Two Pointers", count: 218 },
	{ slug: "bit-manipulation", name: "Bit Manipulation", count: 213 },
	{ slug: "stack", name: "Stack", count: 198 },
	{ slug: "heap", name: "Heap (Priority Queue)", count: 186 },
	{ slug: "graph", name: "Graph", count: 174 },
	{ slug: "design", name: "Design", count: 168 },
	{ slug: "linked-list", name: "Linked List", count: 152 },
];

export const MOCK_CATEGORIES = [
	"All Topics",
	"Algorithms",
	"Database",
	"Shell",
	"Concurrency",
];

export const MOCK_BANNERS: BannerCard[] = [
	{
		id: "js-30",
		title: "30 Days of JavaScript",
		subtitle: "Master JS fundamentals with daily challenges",
		gradient: "from-blue-500 to-cyan-400",
		cta: "Start Learning",
		href: "#",
	},
	{
		id: "dp-study",
		title: "Dynamic Programming Study Plan",
		subtitle: "Conquer DP problems step by step",
		gradient: "from-purple-500 to-pink-400",
		cta: "Begin Plan",
		href: "#",
	},
	{
		id: "weekly-contest",
		title: "Weekly Contest 380",
		subtitle: "Sunday 10:30 AM (Beijing Time)",
		gradient: "from-orange-500 to-yellow-400",
		cta: "Register Now",
		href: "#",
	},
];

function generateCalendarData(): CalendarDay[] {
	const days: CalendarDay[] = [];
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth();

	// Generate data for last 12 months
	for (let m = 0; m < 12; m++) {
		const d = new Date(year, month - 11 + m, 1);
		const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(d.getFullYear(), d.getMonth(), day);
			if (date > now) break;
			// Deterministic pseudo-random based on date
			const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + day;
			const hash = ((seed * 2654435761) >>> 0) % 100;
			let count = 0;
			if (hash < 30) count = 0;
			else if (hash < 55) count = 1;
			else if (hash < 75) count = 2;
			else if (hash < 90) count = 3;
			else count = 4;
			const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			days.push({ date: dateStr, count });
		}
	}
	return days;
}

export const MOCK_CALENDAR_DATA: CalendarDay[] = generateCalendarData();

export const MOCK_TRENDING_COMPANIES: TrendingCompany[] = [
	{ name: "Google", slug: "google", problemCount: 1882 },
	{ name: "Meta", slug: "meta", problemCount: 1024 },
	{ name: "Amazon", slug: "amazon", problemCount: 956 },
	{ name: "Microsoft", slug: "microsoft", problemCount: 892 },
	{ name: "Apple", slug: "apple", problemCount: 634 },
	{ name: "Bloomberg", slug: "bloomberg", problemCount: 498 },
	{ name: "Goldman Sachs", slug: "goldman-sachs", problemCount: 356 },
	{ name: "Adobe", slug: "adobe", problemCount: 312 },
	{ name: "Uber", slug: "uber", problemCount: 289 },
	{ name: "ByteDance", slug: "bytedance", problemCount: 267 },
];

export const MOCK_STUDY_PLANS: StudyPlanItem[] = [
	{ id: "top-150", title: "Top Interview 150", icon: "🎯", href: "#", progress: 32 },
	{ id: "lc-75", title: "LeetCode 75", icon: "🔥", href: "#", progress: 68 },
	{ id: "sql-50", title: "SQL 50", icon: "🗄️", href: "#", progress: 12 },
	{ id: "intro-30", title: "30 Days of JS", icon: "⚡", href: "#" },
];

/**
 * Deterministic mock acceptance rate + frequency for a given problem ID.
 * This enriches the backend problem list items with extra data for the enhanced table.
 */
export function enrichProblemWithMockData(problemId: number) {
	const seed = ((problemId * 2654435761) >>> 0);
	const acceptance = 25 + (seed % 55); // 25% – 79%
	const frequency = (((seed >>> 8) % 80) + 10) / 100; // 0.10 – 0.89
	return { acceptance, frequency };
}
