import { Tag, Module, SolutionEntry, TopicAbility, Collection } from "@/utils/types/problem";

export const MOCK_TAGS: Tag[] = [
	// topic
	{ id: "t1", name: "数组", type: "topic", is_vip_only: false },
	{ id: "t2", name: "链表", type: "topic", is_vip_only: false },
	{ id: "t3", name: "二叉树", type: "topic", is_vip_only: false },
	{ id: "t4", name: "动态规划", type: "topic", is_vip_only: false },
	{ id: "t5", name: "回溯", type: "topic", is_vip_only: false },
	{ id: "t6", name: "图论", type: "topic", is_vip_only: false },
	{ id: "t7", name: "贪心", type: "topic", is_vip_only: false },
	{ id: "t8", name: "双指针", type: "topic", is_vip_only: false },
	// company
	{ id: "c1", name: "字节跳动", type: "company", is_vip_only: true },
	{ id: "c2", name: "Meta", type: "company", is_vip_only: true },
	{ id: "c3", name: "Google", type: "company", is_vip_only: true },
	{ id: "c4", name: "腾讯", type: "company", is_vip_only: true },
	// position
	{ id: "p1", name: "保研机试", type: "position", is_vip_only: false },
	{ id: "p2", name: "考研复试", type: "position", is_vip_only: false },
	{ id: "p3", name: "秋招笔试", type: "position", is_vip_only: false },
];

// ── 代码随想录 (Carl's LeetCode Master) ──
// Source: https://github.com/youngyangyang04/leetcode-master
export const MOCK_CARL_CURRICULUM: Module[] = [
	{
		id: "carl-arr",
		title: "数组",
		description: "数组基础：二分查找、双指针、滑动窗口、模拟",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-arr-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 704, title: "Binary Search", slug: "binary-search", difficulty: "Easy", is_vip_only: false },
					{ id: 27, title: "Remove Element", slug: "remove-element", difficulty: "Easy", is_vip_only: false },
					{ id: 977, title: "Squares of a Sorted Array", slug: "squares-of-a-sorted-array", difficulty: "Easy", is_vip_only: false },
					{ id: 209, title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 59, title: "Spiral Matrix II", slug: "spiral-matrix-ii", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-list",
		title: "链表",
		description: "链表操作：虚拟头节点、反转、环检测、交叉",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-list-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 203, title: "Remove Linked List Elements", slug: "remove-linked-list-elements", difficulty: "Easy", is_vip_only: false },
					{ id: 707, title: "Design Linked List", slug: "design-linked-list", difficulty: "Medium", is_vip_only: false },
					{ id: 206, title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", is_vip_only: false },
					{ id: 24, title: "Swap Nodes in Pairs", slug: "swap-nodes-in-pairs", difficulty: "Medium", is_vip_only: false },
					{ id: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "Medium", is_vip_only: false },
					{ id: 142, title: "Linked List Cycle II", slug: "linked-list-cycle-ii", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-hash",
		title: "哈希表",
		description: "哈希表：数组模拟哈希、set/map 应用",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-hash-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 242, title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", is_vip_only: false },
					{ id: 349, title: "Intersection of Two Arrays", slug: "intersection-of-two-arrays", difficulty: "Easy", is_vip_only: false },
					{ id: 202, title: "Happy Number", slug: "happy-number", difficulty: "Easy", is_vip_only: false },
					{ id: 1, title: "Two Sum", slug: "two-sum", difficulty: "Easy", is_vip_only: false },
					{ id: 454, title: "4Sum II", slug: "4sum-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 15, title: "3Sum", slug: "3sum", difficulty: "Medium", is_vip_only: false },
					{ id: 18, title: "4Sum", slug: "4sum", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-str",
		title: "字符串",
		description: "字符串操作：反转、KMP 算法、重复子串",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-str-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 344, title: "Reverse String", slug: "reverse-string", difficulty: "Easy", is_vip_only: false },
					{ id: 541, title: "Reverse String II", slug: "reverse-string-ii", difficulty: "Easy", is_vip_only: false },
					{ id: 151, title: "Reverse Words in a String", slug: "reverse-words-in-a-string", difficulty: "Medium", is_vip_only: false },
					{ id: 28, title: "Find the Index of the First Occurrence in a String", slug: "find-the-index-of-the-first-occurrence-in-a-string", difficulty: "Easy", is_vip_only: false },
					{ id: 459, title: "Repeated Substring Pattern", slug: "repeated-substring-pattern", difficulty: "Easy", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-stack",
		title: "栈与队列",
		description: "栈和队列的经典应用与单调队列",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-stack-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 232, title: "Implement Queue using Stacks", slug: "implement-queue-using-stacks", difficulty: "Easy", is_vip_only: false },
					{ id: 225, title: "Implement Stack using Queues", slug: "implement-stack-using-queues", difficulty: "Easy", is_vip_only: false },
					{ id: 20, title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", is_vip_only: false },
					{ id: 1047, title: "Remove All Adjacent Duplicates In String", slug: "remove-all-adjacent-duplicates-in-string", difficulty: "Easy", is_vip_only: false },
					{ id: 150, title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "Medium", is_vip_only: false },
					{ id: 239, title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: "Hard", is_vip_only: false },
					{ id: 347, title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-tree",
		title: "二叉树",
		description: "二叉树遍历、属性、构造、BST",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-tree-traverse",
				title: "遍历与属性",
				is_vip_only: false,
				problems: [
					{ id: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", is_vip_only: false },
					{ id: 226, title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 101, title: "Symmetric Tree", slug: "symmetric-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 110, title: "Balanced Binary Tree", slug: "balanced-binary-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 257, title: "Binary Tree Paths", slug: "binary-tree-paths", difficulty: "Easy", is_vip_only: false },
					{ id: 112, title: "Path Sum", slug: "path-sum", difficulty: "Easy", is_vip_only: false },
				],
			},
			{
				id: "carl-tree-bst",
				title: "二叉搜索树",
				is_vip_only: false,
				problems: [
					{ id: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "Medium", is_vip_only: false },
					{ id: 700, title: "Search in a Binary Search Tree", slug: "search-in-a-binary-search-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 701, title: "Insert into a Binary Search Tree", slug: "insert-into-a-binary-search-tree", difficulty: "Medium", is_vip_only: false },
					{ id: 450, title: "Delete Node in a BST", slug: "delete-node-in-a-bst", difficulty: "Medium", is_vip_only: false },
					{ id: 235, title: "Lowest Common Ancestor of a BST", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-bt",
		title: "回溯算法",
		description: "组合、切割、子集、排列、棋盘问题",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-bt-combo",
				title: "组合与切割",
				is_vip_only: false,
				problems: [
					{ id: 77, title: "Combinations", slug: "combinations", difficulty: "Medium", is_vip_only: false },
					{ id: 216, title: "Combination Sum III", slug: "combination-sum-iii", difficulty: "Medium", is_vip_only: false },
					{ id: 17, title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", difficulty: "Medium", is_vip_only: false },
					{ id: 39, title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 40, title: "Combination Sum II", slug: "combination-sum-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 131, title: "Palindrome Partitioning", slug: "palindrome-partitioning", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "carl-bt-perm",
				title: "子集与排列",
				is_vip_only: false,
				problems: [
					{ id: 78, title: "Subsets", slug: "subsets", difficulty: "Medium", is_vip_only: false },
					{ id: 90, title: "Subsets II", slug: "subsets-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 46, title: "Permutations", slug: "permutations", difficulty: "Medium", is_vip_only: false },
					{ id: 47, title: "Permutations II", slug: "permutations-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 51, title: "N-Queens", slug: "n-queens", difficulty: "Hard", is_vip_only: false },
					{ id: 37, title: "Sudoku Solver", slug: "sudoku-solver", difficulty: "Hard", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-greedy",
		title: "贪心算法",
		description: "局部最优推全局最优的经典贪心题目",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-greedy-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 455, title: "Assign Cookies", slug: "assign-cookies", difficulty: "Easy", is_vip_only: false },
					{ id: 376, title: "Wiggle Subsequence", slug: "wiggle-subsequence", difficulty: "Medium", is_vip_only: false },
					{ id: 53, title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", is_vip_only: false },
					{ id: 122, title: "Best Time to Buy and Sell Stock II", slug: "best-time-to-buy-and-sell-stock-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 55, title: "Jump Game", slug: "jump-game", difficulty: "Medium", is_vip_only: false },
					{ id: 45, title: "Jump Game II", slug: "jump-game-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 134, title: "Gas Station", slug: "gas-station", difficulty: "Medium", is_vip_only: false },
					{ id: 406, title: "Queue Reconstruction by Height", slug: "queue-reconstruction-by-height", difficulty: "Medium", is_vip_only: false },
					{ id: 452, title: "Minimum Number of Arrows to Burst Balloons", slug: "minimum-number-of-arrows-to-burst-balloons", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-dp",
		title: "动态规划",
		description: "基础 DP、背包问题、股票系列、子序列",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-dp-basic",
				title: "基础 DP",
				is_vip_only: false,
				problems: [
					{ id: 509, title: "Fibonacci Number", slug: "fibonacci-number", difficulty: "Easy", is_vip_only: false },
					{ id: 70, title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", is_vip_only: false },
					{ id: 746, title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs", difficulty: "Easy", is_vip_only: false },
					{ id: 62, title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", is_vip_only: false },
					{ id: 63, title: "Unique Paths II", slug: "unique-paths-ii", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "carl-dp-knapsack",
				title: "背包问题",
				is_vip_only: false,
				problems: [
					{ id: 416, title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 1049, title: "Last Stone Weight II", slug: "last-stone-weight-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 494, title: "Target Sum", slug: "target-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 474, title: "Ones and Zeroes", slug: "ones-and-zeroes", difficulty: "Medium", is_vip_only: false },
					{ id: 518, title: "Coin Change II", slug: "coin-change-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 322, title: "Coin Change", slug: "coin-change", difficulty: "Medium", is_vip_only: false },
					{ id: 279, title: "Perfect Squares", slug: "perfect-squares", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "carl-dp-stock",
				title: "股票系列",
				is_vip_only: false,
				problems: [
					{ id: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", is_vip_only: false },
					{ id: 122, title: "Best Time to Buy and Sell Stock II", slug: "best-time-to-buy-and-sell-stock-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 123, title: "Best Time to Buy and Sell Stock III", slug: "best-time-to-buy-and-sell-stock-iii", difficulty: "Hard", is_vip_only: false },
					{ id: 188, title: "Best Time to Buy and Sell Stock IV", slug: "best-time-to-buy-and-sell-stock-iv", difficulty: "Hard", is_vip_only: false },
					{ id: 309, title: "Best Time to Buy and Sell Stock with Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown", difficulty: "Medium", is_vip_only: false },
					{ id: 714, title: "Best Time to Buy and Sell Stock with Transaction Fee", slug: "best-time-to-buy-and-sell-stock-with-transaction-fee", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "carl-dp-subseq",
				title: "子序列系列",
				is_vip_only: false,
				problems: [
					{ id: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "Medium", is_vip_only: false },
					{ id: 1143, title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "Medium", is_vip_only: false },
					{ id: 198, title: "House Robber", slug: "house-robber", difficulty: "Medium", is_vip_only: false },
					{ id: 213, title: "House Robber II", slug: "house-robber-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 72, title: "Edit Distance", slug: "edit-distance", difficulty: "Medium", is_vip_only: false },
					{ id: 647, title: "Palindromic Substrings", slug: "palindromic-substrings", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "carl-mono",
		title: "单调栈",
		description: "单调栈经典应用：下一个更大元素、接雨水",
		is_vip_only: false,
		subModules: [
			{
				id: "carl-mono-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 739, title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", is_vip_only: false },
					{ id: 496, title: "Next Greater Element I", slug: "next-greater-element-i", difficulty: "Easy", is_vip_only: false },
					{ id: 503, title: "Next Greater Element II", slug: "next-greater-element-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", is_vip_only: false },
					{ id: 84, title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "Hard", is_vip_only: false },
				],
			},
		],
	},
];

// ── 灵茶山艾府 科学刷题 ──
// Source: https://leetcode.cn/discuss/post/3141566/
export const MOCK_LINGSHEN_CURRICULUM: Module[] = [
	{
		id: "ls-sw",
		title: "滑动窗口与双指针",
		description: "定长窗口、不定长窗口、单序列双指针、双序列双指针",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-sw-fix",
				title: "定长滑动窗口",
				is_vip_only: false,
				problems: [
					{ id: 1456, title: "Maximum Number of Vowels in a Substring of Given Length", slug: "maximum-number-of-vowels-in-a-substring-of-given-length", difficulty: "Medium", is_vip_only: false },
					{ id: 643, title: "Maximum Average Subarray I", slug: "maximum-average-subarray-i", difficulty: "Easy", is_vip_only: false },
					{ id: 1343, title: "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", slug: "number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "ls-sw-var",
				title: "不定长滑动窗口",
				is_vip_only: false,
				problems: [
					{ id: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", is_vip_only: false },
					{ id: 209, title: "Minimum Size Subarray Sum", slug: "minimum-size-subarray-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 713, title: "Subarray Product Less Than K", slug: "subarray-product-less-than-k", difficulty: "Medium", is_vip_only: false },
					{ id: 76, title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", is_vip_only: false },
				],
			},
			{
				id: "ls-sw-tp",
				title: "双指针",
				is_vip_only: false,
				problems: [
					{ id: 167, title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", difficulty: "Medium", is_vip_only: false },
					{ id: 15, title: "3Sum", slug: "3sum", difficulty: "Medium", is_vip_only: false },
					{ id: 11, title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", is_vip_only: false },
					{ id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "ls-bs",
		title: "二分查找",
		description: "二分答案、最小化最大值、最大化最小值",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-bs-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 34, title: "Find First and Last Position of Element in Sorted Array", slug: "find-first-and-last-position-of-element-in-sorted-array", difficulty: "Medium", is_vip_only: false },
					{ id: 162, title: "Find Peak Element", slug: "find-peak-element", difficulty: "Medium", is_vip_only: false },
					{ id: 153, title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", is_vip_only: false },
					{ id: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", is_vip_only: false },
					{ id: 74, title: "Search a 2D Matrix", slug: "search-a-2d-matrix", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "ls-bs-ans",
				title: "二分答案",
				is_vip_only: false,
				problems: [
					{ id: 875, title: "Koko Eating Bananas", slug: "koko-eating-bananas", difficulty: "Medium", is_vip_only: false },
					{ id: 1011, title: "Capacity To Ship Packages Within D Days", slug: "capacity-to-ship-packages-within-d-days", difficulty: "Medium", is_vip_only: false },
					{ id: 410, title: "Split Array Largest Sum", slug: "split-array-largest-sum", difficulty: "Hard", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "ls-mono",
		title: "单调栈",
		description: "基础单调栈、矩形面积、贡献法",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-mono-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 739, title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", is_vip_only: false },
					{ id: 496, title: "Next Greater Element I", slug: "next-greater-element-i", difficulty: "Easy", is_vip_only: false },
					{ id: 84, title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "Hard", is_vip_only: false },
					{ id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", is_vip_only: false },
					{ id: 907, title: "Sum of Subarray Minimums", slug: "sum-of-subarray-minimums", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "ls-grid",
		title: "网格图 DFS/BFS",
		description: "网格图上的深度优先搜索和广度优先搜索",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-grid-core",
				title: "核心题目",
				is_vip_only: false,
				problems: [
					{ id: 200, title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", is_vip_only: false },
					{ id: 695, title: "Max Area of Island", slug: "max-area-of-island", difficulty: "Medium", is_vip_only: false },
					{ id: 994, title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium", is_vip_only: false },
					{ id: 130, title: "Surrounded Regions", slug: "surrounded-regions", difficulty: "Medium", is_vip_only: false },
					{ id: 417, title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "ls-dp",
		title: "动态规划",
		description: "入门 DP、背包、划分、状态机、区间 DP",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-dp-intro",
				title: "入门 DP",
				is_vip_only: false,
				problems: [
					{ id: 70, title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", is_vip_only: false },
					{ id: 198, title: "House Robber", slug: "house-robber", difficulty: "Medium", is_vip_only: false },
					{ id: 322, title: "Coin Change", slug: "coin-change", difficulty: "Medium", is_vip_only: false },
					{ id: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "Medium", is_vip_only: false },
					{ id: 1143, title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "Medium", is_vip_only: false },
					{ id: 72, title: "Edit Distance", slug: "edit-distance", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "ls-dp-knapsack",
				title: "背包问题",
				is_vip_only: false,
				problems: [
					{ id: 416, title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 494, title: "Target Sum", slug: "target-sum", difficulty: "Medium", is_vip_only: false },
					{ id: 518, title: "Coin Change II", slug: "coin-change-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 279, title: "Perfect Squares", slug: "perfect-squares", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "ls-dp-state",
				title: "状态机 DP",
				is_vip_only: false,
				problems: [
					{ id: 121, title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", is_vip_only: false },
					{ id: 122, title: "Best Time to Buy and Sell Stock II", slug: "best-time-to-buy-and-sell-stock-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 309, title: "Best Time to Buy and Sell Stock with Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown", difficulty: "Medium", is_vip_only: false },
					{ id: 188, title: "Best Time to Buy and Sell Stock IV", slug: "best-time-to-buy-and-sell-stock-iv", difficulty: "Hard", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "ls-tree",
		title: "树与回溯",
		description: "二叉树 DFS/BFS、直径、LCA、回溯模板",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-tree-dfs",
				title: "DFS",
				is_vip_only: false,
				problems: [
					{ id: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 100, title: "Same Tree", slug: "same-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 101, title: "Symmetric Tree", slug: "symmetric-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 110, title: "Balanced Binary Tree", slug: "balanced-binary-tree", difficulty: "Easy", is_vip_only: false },
					{ id: 236, title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree", difficulty: "Medium", is_vip_only: false },
				],
			},
			{
				id: "ls-tree-bt",
				title: "回溯",
				is_vip_only: false,
				problems: [
					{ id: 46, title: "Permutations", slug: "permutations", difficulty: "Medium", is_vip_only: false },
					{ id: 78, title: "Subsets", slug: "subsets", difficulty: "Medium", is_vip_only: false },
					{ id: 17, title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", difficulty: "Medium", is_vip_only: false },
					{ id: 22, title: "Generate Parentheses", slug: "generate-parentheses", difficulty: "Medium", is_vip_only: false },
					{ id: 51, title: "N-Queens", slug: "n-queens", difficulty: "Hard", is_vip_only: false },
				],
			},
		],
	},
	{
		id: "ls-graph",
		title: "图论",
		description: "DFS/BFS、拓扑排序、最短路、最小生成树",
		is_vip_only: false,
		subModules: [
			{
				id: "ls-graph-core",
				title: "基础图论",
				is_vip_only: false,
				problems: [
					{ id: 207, title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", is_vip_only: false },
					{ id: 210, title: "Course Schedule II", slug: "course-schedule-ii", difficulty: "Medium", is_vip_only: false },
					{ id: 743, title: "Network Delay Time", slug: "network-delay-time", difficulty: "Medium", is_vip_only: false },
					{ id: 785, title: "Is Graph Bipartite?", slug: "is-graph-bipartite", difficulty: "Medium", is_vip_only: false },
					{ id: 684, title: "Redundant Connection", slug: "redundant-connection", difficulty: "Medium", is_vip_only: false },
				],
			},
		],
	},
];

/** Combined curriculum list for the UI. Default shows both. */
export const MOCK_CURRICULUM: Module[] = MOCK_CARL_CURRICULUM;

export const MOCK_SOLUTIONS: SolutionEntry[] = [
	{
		language: "C++",
		langKey: "cpp",
		code: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (mp.count(complement)) {
                return {mp[complement], i};
            }
            mp[nums[i]] = i;
        }
        return {};
    }
};`,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
	},
	{
		language: "Java",
		langKey: "java",
		code: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
	},
	{
		language: "Python",
		langKey: "python3",
		code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
	},
	{
		language: "Go",
		langKey: "go",
		code: `func twoSum(nums []int, target int) []int {
    m := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if j, ok := m[complement]; ok {
            return []int{j, i}
        }
        m[num] = i
    }
    return nil
}`,
		timeComplexity: "O(n)",
		spaceComplexity: "O(n)",
	},
];

export const MOCK_TOPIC_ABILITIES: TopicAbility[] = [
	{ topic: "数组", shortLabel: "数组", score: 85, totalProblems: 40, solvedProblems: 34, passRate: 92 },
	{ topic: "链表", shortLabel: "链表", score: 72, totalProblems: 25, solvedProblems: 18, passRate: 85 },
	{ topic: "二叉树", shortLabel: "树", score: 60, totalProblems: 35, solvedProblems: 21, passRate: 78 },
	{ topic: "动态规划", shortLabel: "DP", score: 45, totalProblems: 50, solvedProblems: 22, passRate: 65 },
	{ topic: "回溯", shortLabel: "回溯", score: 55, totalProblems: 20, solvedProblems: 11, passRate: 70 },
	{ topic: "图论", shortLabel: "图", score: 38, totalProblems: 30, solvedProblems: 11, passRate: 58 },
	{ topic: "贪心", shortLabel: "贪心", score: 68, totalProblems: 22, solvedProblems: 15, passRate: 82 },
	{ topic: "双指针", shortLabel: "指针", score: 78, totalProblems: 18, solvedProblems: 14, passRate: 88 },
];

export const MOCK_COLLECTIONS: Collection[] = [
	{
		id: "col1",
		title: "代码随想录",
		description: "跟着代码随想录系统刷题，涵盖所有核心算法考点",
		cover_image: "",
		difficulty_level: "Beginner",
		is_vip_only: false,
		problems: [
			{ id: 1, title: "Two Sum", slug: "two-sum", difficulty: "Easy", is_vip_only: false },
			{ id: 206, title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", is_vip_only: false },
			{ id: 55, title: "Jump Game", slug: "jump-game", difficulty: "Medium", is_vip_only: false },
		],
	},
	{
		id: "col2",
		title: "Meta 高频 50 题",
		description: "Meta 面试最常考的 50 道算法题精选",
		cover_image: "",
		difficulty_level: "Intermediate",
		is_vip_only: true,
		problems: [
			{ id: 1, title: "Two Sum", slug: "two-sum", difficulty: "Easy", is_vip_only: false },
			{ id: 15, title: "3Sum", slug: "3sum", difficulty: "Medium", is_vip_only: false },
			{ id: 33, title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", is_vip_only: false },
		],
	},
	{
		id: "col3",
		title: "清北保研必刷",
		description: "清华北大保研机试高频题目合集",
		cover_image: "",
		difficulty_level: "Advanced",
		is_vip_only: true,
		problems: [
			{ id: 74, title: "Search a 2D Matrix", slug: "search-a-2d-matrix", difficulty: "Medium", is_vip_only: false },
			{ id: 62, title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", is_vip_only: true },
			{ id: 64, title: "Minimum Path Sum", slug: "minimum-path-sum", difficulty: "Medium", is_vip_only: true },
		],
	},
];

export const MOCK_MATH_CONTENT = `
## 题目描述

给定一个整数数组 $nums$ 和一个整数目标值 $target$，请你在该数组中找出**和为目标值** $target$ 的那 **两个** 整数，并返回它们的数组下标。

### 复杂度分析

- **时间复杂度**: $O(n)$，其中 $n$ 是数组长度
- **空间复杂度**: $O(n)$

### 数学推导

对于哈希表解法，我们利用以下性质：

$$
\\text{若 } nums[i] + nums[j] = target \\text{，则 } nums[j] = target - nums[i]
$$

因此只需在遍历过程中查找 $target - nums[i]$ 是否已经存在于哈希表中。
`;
