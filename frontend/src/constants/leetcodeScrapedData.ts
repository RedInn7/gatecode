// Auto-generated from LeetCode data scrape
// Do not edit manually

export type CompanyProblem = {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  paidOnly: boolean;
  frequency?: number;
};

export type CompanyTag = {
  name: string;
  slug: string;
  questionCount: number;
};

export type StudyPlanProblem = {
  id: number;
  title: string;
  titleCn: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  paidOnly: boolean;
};

export type StudyPlanGroup = {
  name: string;
  slug: string;
  problems: StudyPlanProblem[];
};

export type StudyPlan = {
  name: string;
  slug: string;
  groups: StudyPlanGroup[];
};

export const COMPANY_TAGS: CompanyTag[] = [
  {
    "name": "Google",
    "slug": "google",
    "questionCount": 2219
  },
  {
    "name": "Amazon",
    "slug": "amazon",
    "questionCount": 1938
  },
  {
    "name": "Meta",
    "slug": "facebook",
    "questionCount": 1389
  },
  {
    "name": "Microsoft",
    "slug": "microsoft",
    "questionCount": 1351
  },
  {
    "name": "Bloomberg",
    "slug": "bloomberg",
    "questionCount": 1172
  },
  {
    "name": "TikTok",
    "slug": "tiktok",
    "questionCount": 383
  },
  {
    "name": "Uber",
    "slug": "uber",
    "questionCount": 380
  },
  {
    "name": "Apple",
    "slug": "apple",
    "questionCount": 355
  },
  {
    "name": "Oracle",
    "slug": "oracle",
    "questionCount": 339
  },
  {
    "name": "Goldman Sachs",
    "slug": "goldman-sachs",
    "questionCount": 270
  },
  {
    "name": "Adobe",
    "slug": "adobe",
    "questionCount": 223
  },
  {
    "name": "tcs",
    "slug": "tcs",
    "questionCount": 218
  },
  {
    "name": "Salesforce",
    "slug": "salesforce",
    "questionCount": 191
  },
  {
    "name": "LinkedIn",
    "slug": "linkedin",
    "questionCount": 179
  },
  {
    "name": "Zoho",
    "slug": "zoho",
    "questionCount": 178
  },
  {
    "name": "IBM",
    "slug": "ibm",
    "questionCount": 170
  },
  {
    "name": "Infosys",
    "slug": "infosys",
    "questionCount": 158
  },
  {
    "name": "Walmart Labs",
    "slug": "walmart-labs",
    "questionCount": 152
  },
  {
    "name": "Accenture",
    "slug": "accenture",
    "questionCount": 143
  },
  {
    "name": "Nvidia",
    "slug": "nvidia",
    "questionCount": 137
  },
  {
    "name": "Yandex",
    "slug": "yandex",
    "questionCount": 134
  },
  {
    "name": "Visa",
    "slug": "visa",
    "questionCount": 125
  },
  {
    "name": "DE Shaw",
    "slug": "de-shaw",
    "questionCount": 124
  },
  {
    "name": "Flipkart",
    "slug": "flipkart",
    "questionCount": 117
  },
  {
    "name": "PayPal",
    "slug": "paypal",
    "questionCount": 107
  },
  {
    "name": "Snowflake",
    "slug": "snowflake",
    "questionCount": 104
  },
  {
    "name": "PhonePe",
    "slug": "phonepe",
    "questionCount": 102
  },
  {
    "name": "Snap",
    "slug": "snapchat",
    "questionCount": 99
  },
  {
    "name": "Citadel",
    "slug": "citadel",
    "questionCount": 97
  },
  {
    "name": "DoorDash",
    "slug": "doordash",
    "questionCount": 87
  }
];

export const STUDY_PLANS: Record<string, StudyPlan> = {
  "top-interview-150": {
    "name": "面试经典 150 题",
    "slug": "top-interview-150",
    "groups": [
      {
        "name": "数组 / 字符串",
        "slug": "array-string",
        "problems": [
          {
            "id": 88,
            "title": "Merge Sorted Array",
            "titleCn": "合并两个有序数组",
            "slug": "merge-sorted-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 27,
            "title": "Remove Element",
            "titleCn": "移除元素",
            "slug": "remove-element",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 26,
            "title": "Remove Duplicates from Sorted Array",
            "titleCn": "删除有序数组中的重复项",
            "slug": "remove-duplicates-from-sorted-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 80,
            "title": "Remove Duplicates from Sorted Array II",
            "titleCn": "删除有序数组中的重复项 II",
            "slug": "remove-duplicates-from-sorted-array-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 169,
            "title": "Majority Element",
            "titleCn": "多数元素",
            "slug": "majority-element",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 189,
            "title": "Rotate Array",
            "titleCn": "轮转数组",
            "slug": "rotate-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 121,
            "title": "Best Time to Buy and Sell Stock",
            "titleCn": "买卖股票的最佳时机",
            "slug": "best-time-to-buy-and-sell-stock",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 122,
            "title": "Best Time to Buy and Sell Stock II",
            "titleCn": "买卖股票的最佳时机 II",
            "slug": "best-time-to-buy-and-sell-stock-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 55,
            "title": "Jump Game",
            "titleCn": "跳跃游戏",
            "slug": "jump-game",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 45,
            "title": "Jump Game II",
            "titleCn": "跳跃游戏 II",
            "slug": "jump-game-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 274,
            "title": "H-Index",
            "titleCn": "H 指数",
            "slug": "h-index",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 380,
            "title": "Insert Delete GetRandom O(1)",
            "titleCn": "O(1) 时间插入、删除和获取随机元素",
            "slug": "insert-delete-getrandom-o1",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 238,
            "title": "Product of Array Except Self",
            "titleCn": "除了自身以外数组的乘积",
            "slug": "product-of-array-except-self",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 134,
            "title": "Gas Station",
            "titleCn": "加油站",
            "slug": "gas-station",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 135,
            "title": "Candy",
            "titleCn": "分发糖果",
            "slug": "candy",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 42,
            "title": "Trapping Rain Water",
            "titleCn": "接雨水",
            "slug": "trapping-rain-water",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 13,
            "title": "Roman to Integer",
            "titleCn": "罗马数字转整数",
            "slug": "roman-to-integer",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 12,
            "title": "Integer to Roman",
            "titleCn": "整数转罗马数字",
            "slug": "integer-to-roman",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 58,
            "title": "Length of Last Word",
            "titleCn": "最后一个单词的长度",
            "slug": "length-of-last-word",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 14,
            "title": "Longest Common Prefix",
            "titleCn": "最长公共前缀",
            "slug": "longest-common-prefix",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 151,
            "title": "Reverse Words in a String",
            "titleCn": "反转字符串中的单词",
            "slug": "reverse-words-in-a-string",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 6,
            "title": "Zigzag Conversion",
            "titleCn": "Z 字形变换",
            "slug": "zigzag-conversion",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 28,
            "title": "Find the Index of the First Occurrence in a String",
            "titleCn": "找出字符串中第一个匹配项的下标",
            "slug": "find-the-index-of-the-first-occurrence-in-a-string",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 68,
            "title": "Text Justification",
            "titleCn": "文本左右对齐",
            "slug": "text-justification",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "双指针",
        "slug": "two-pointers",
        "problems": [
          {
            "id": 125,
            "title": "Valid Palindrome",
            "titleCn": "验证回文串",
            "slug": "valid-palindrome",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 392,
            "title": "Is Subsequence",
            "titleCn": "判断子序列",
            "slug": "is-subsequence",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 167,
            "title": "Two Sum II - Input Array Is Sorted",
            "titleCn": "两数之和 II - 输入有序数组",
            "slug": "two-sum-ii-input-array-is-sorted",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 11,
            "title": "Container With Most Water",
            "titleCn": "盛最多水的容器",
            "slug": "container-with-most-water",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 15,
            "title": "3Sum",
            "titleCn": "三数之和",
            "slug": "3sum",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "滑动窗口",
        "slug": "sliding-window",
        "problems": [
          {
            "id": 209,
            "title": "Minimum Size Subarray Sum",
            "titleCn": "长度最小的子数组",
            "slug": "minimum-size-subarray-sum",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 3,
            "title": "Longest Substring Without Repeating Characters",
            "titleCn": "无重复字符的最长子串",
            "slug": "longest-substring-without-repeating-characters",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 30,
            "title": "Substring with Concatenation of All Words",
            "titleCn": "串联所有单词的子串",
            "slug": "substring-with-concatenation-of-all-words",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 76,
            "title": "Minimum Window Substring",
            "titleCn": "最小覆盖子串",
            "slug": "minimum-window-substring",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "矩阵",
        "slug": "matrix",
        "problems": [
          {
            "id": 36,
            "title": "Valid Sudoku",
            "titleCn": "有效的数独",
            "slug": "valid-sudoku",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 54,
            "title": "Spiral Matrix",
            "titleCn": "螺旋矩阵",
            "slug": "spiral-matrix",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 48,
            "title": "Rotate Image",
            "titleCn": "旋转图像",
            "slug": "rotate-image",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 73,
            "title": "Set Matrix Zeroes",
            "titleCn": "矩阵置零",
            "slug": "set-matrix-zeroes",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 289,
            "title": "Game of Life",
            "titleCn": "生命游戏",
            "slug": "game-of-life",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "哈希表",
        "slug": "hashmap",
        "problems": [
          {
            "id": 383,
            "title": "Ransom Note",
            "titleCn": "赎金信",
            "slug": "ransom-note",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 205,
            "title": "Isomorphic Strings",
            "titleCn": "同构字符串",
            "slug": "isomorphic-strings",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 290,
            "title": "Word Pattern",
            "titleCn": "单词规律",
            "slug": "word-pattern",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 242,
            "title": "Valid Anagram",
            "titleCn": "有效的字母异位词",
            "slug": "valid-anagram",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 49,
            "title": "Group Anagrams",
            "titleCn": "字母异位词分组",
            "slug": "group-anagrams",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1,
            "title": "Two Sum",
            "titleCn": "两数之和",
            "slug": "two-sum",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 202,
            "title": "Happy Number",
            "titleCn": "快乐数",
            "slug": "happy-number",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 219,
            "title": "Contains Duplicate II",
            "titleCn": "存在重复元素 II",
            "slug": "contains-duplicate-ii",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 128,
            "title": "Longest Consecutive Sequence",
            "titleCn": "最长连续序列",
            "slug": "longest-consecutive-sequence",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "区间",
        "slug": "top-interview-150-6-wpca",
        "problems": [
          {
            "id": 228,
            "title": "Summary Ranges",
            "titleCn": "汇总区间",
            "slug": "summary-ranges",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 56,
            "title": "Merge Intervals",
            "titleCn": "合并区间",
            "slug": "merge-intervals",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 57,
            "title": "Insert Interval",
            "titleCn": "插入区间",
            "slug": "insert-interval",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 452,
            "title": "Minimum Number of Arrows to Burst Balloons",
            "titleCn": "用最少数量的箭引爆气球",
            "slug": "minimum-number-of-arrows-to-burst-balloons",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "栈",
        "slug": "top-interview-150-7-s710",
        "problems": [
          {
            "id": 20,
            "title": "Valid Parentheses",
            "titleCn": "有效的括号",
            "slug": "valid-parentheses",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 71,
            "title": "Simplify Path",
            "titleCn": "简化路径",
            "slug": "simplify-path",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 155,
            "title": "Min Stack",
            "titleCn": "最小栈",
            "slug": "min-stack",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 150,
            "title": "Evaluate Reverse Polish Notation",
            "titleCn": "逆波兰表达式求值",
            "slug": "evaluate-reverse-polish-notation",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 224,
            "title": "Basic Calculator",
            "titleCn": "基本计算器",
            "slug": "basic-calculator",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "链表",
        "slug": "top-interview-150-8-v0ee",
        "problems": [
          {
            "id": 141,
            "title": "Linked List Cycle",
            "titleCn": "环形链表",
            "slug": "linked-list-cycle",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2,
            "title": "Add Two Numbers",
            "titleCn": "两数相加",
            "slug": "add-two-numbers",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 21,
            "title": "Merge Two Sorted Lists",
            "titleCn": "合并两个有序链表",
            "slug": "merge-two-sorted-lists",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 138,
            "title": "Copy List with Random Pointer",
            "titleCn": "随机链表的复制",
            "slug": "copy-list-with-random-pointer",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 92,
            "title": "Reverse Linked List II",
            "titleCn": "反转链表 II",
            "slug": "reverse-linked-list-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 25,
            "title": "Reverse Nodes in k-Group",
            "titleCn": "K 个一组翻转链表",
            "slug": "reverse-nodes-in-k-group",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 19,
            "title": "Remove Nth Node From End of List",
            "titleCn": "删除链表的倒数第 N 个结点",
            "slug": "remove-nth-node-from-end-of-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 82,
            "title": "Remove Duplicates from Sorted List II",
            "titleCn": "删除排序链表中的重复元素 II",
            "slug": "remove-duplicates-from-sorted-list-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 61,
            "title": "Rotate List",
            "titleCn": "旋转链表",
            "slug": "rotate-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 86,
            "title": "Partition List",
            "titleCn": "分隔链表",
            "slug": "partition-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 146,
            "title": "LRU Cache",
            "titleCn": "LRU 缓存",
            "slug": "lru-cache",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉树",
        "slug": "top-interview-150-9-f35h",
        "problems": [
          {
            "id": 104,
            "title": "Maximum Depth of Binary Tree",
            "titleCn": "二叉树的最大深度",
            "slug": "maximum-depth-of-binary-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 100,
            "title": "Same Tree",
            "titleCn": "相同的树",
            "slug": "same-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 226,
            "title": "Invert Binary Tree",
            "titleCn": "翻转二叉树",
            "slug": "invert-binary-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 101,
            "title": "Symmetric Tree",
            "titleCn": "对称二叉树",
            "slug": "symmetric-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 105,
            "title": "Construct Binary Tree from Preorder and Inorder Traversal",
            "titleCn": "从前序与中序遍历序列构造二叉树",
            "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 106,
            "title": "Construct Binary Tree from Inorder and Postorder Traversal",
            "titleCn": "从中序与后序遍历序列构造二叉树",
            "slug": "construct-binary-tree-from-inorder-and-postorder-traversal",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 117,
            "title": "Populating Next Right Pointers in Each Node II",
            "titleCn": "填充每个节点的下一个右侧节点指针 II",
            "slug": "populating-next-right-pointers-in-each-node-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 114,
            "title": "Flatten Binary Tree to Linked List",
            "titleCn": "二叉树展开为链表",
            "slug": "flatten-binary-tree-to-linked-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 112,
            "title": "Path Sum",
            "titleCn": "路径总和",
            "slug": "path-sum",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 129,
            "title": "Sum Root to Leaf Numbers",
            "titleCn": "求根节点到叶节点数字之和",
            "slug": "sum-root-to-leaf-numbers",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 124,
            "title": "Binary Tree Maximum Path Sum",
            "titleCn": "二叉树中的最大路径和",
            "slug": "binary-tree-maximum-path-sum",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 173,
            "title": "Binary Search Tree Iterator",
            "titleCn": "二叉搜索树迭代器",
            "slug": "binary-search-tree-iterator",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 222,
            "title": "Count Complete Tree Nodes",
            "titleCn": "完全二叉树的节点个数",
            "slug": "count-complete-tree-nodes",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 236,
            "title": "Lowest Common Ancestor of a Binary Tree",
            "titleCn": "二叉树的最近公共祖先",
            "slug": "lowest-common-ancestor-of-a-binary-tree",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉树层次遍历",
        "slug": "top-interview-150-10-4fmn",
        "problems": [
          {
            "id": 199,
            "title": "Binary Tree Right Side View",
            "titleCn": "二叉树的右视图",
            "slug": "binary-tree-right-side-view",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 637,
            "title": "Average of Levels in Binary Tree",
            "titleCn": "二叉树的层平均值",
            "slug": "average-of-levels-in-binary-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 102,
            "title": "Binary Tree Level Order Traversal",
            "titleCn": "二叉树的层序遍历",
            "slug": "binary-tree-level-order-traversal",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 103,
            "title": "Binary Tree Zigzag Level Order Traversal",
            "titleCn": "二叉树的锯齿形层序遍历",
            "slug": "binary-tree-zigzag-level-order-traversal",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉搜索树",
        "slug": "top-interview-150-11-t9rv",
        "problems": [
          {
            "id": 530,
            "title": "Minimum Absolute Difference in BST",
            "titleCn": "二叉搜索树的最小绝对差",
            "slug": "minimum-absolute-difference-in-bst",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 230,
            "title": "Kth Smallest Element in a BST",
            "titleCn": "二叉搜索树中第 K 小的元素",
            "slug": "kth-smallest-element-in-a-bst",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 98,
            "title": "Validate Binary Search Tree",
            "titleCn": "验证二叉搜索树",
            "slug": "validate-binary-search-tree",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "图",
        "slug": "top-interview-150-12-24yd",
        "problems": [
          {
            "id": 200,
            "title": "Number of Islands",
            "titleCn": "岛屿数量",
            "slug": "number-of-islands",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 130,
            "title": "Surrounded Regions",
            "titleCn": "被围绕的区域",
            "slug": "surrounded-regions",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 133,
            "title": "Clone Graph",
            "titleCn": "克隆图",
            "slug": "clone-graph",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 399,
            "title": "Evaluate Division",
            "titleCn": "除法求值",
            "slug": "evaluate-division",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 207,
            "title": "Course Schedule",
            "titleCn": "课程表",
            "slug": "course-schedule",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 210,
            "title": "Course Schedule II",
            "titleCn": "课程表 II",
            "slug": "course-schedule-ii",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "图的广度优先搜索",
        "slug": "top-interview-150-13-u4s2",
        "problems": [
          {
            "id": 909,
            "title": "Snakes and Ladders",
            "titleCn": "蛇梯棋",
            "slug": "snakes-and-ladders",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 433,
            "title": "Minimum Genetic Mutation",
            "titleCn": "最小基因变化",
            "slug": "minimum-genetic-mutation",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 127,
            "title": "Word Ladder",
            "titleCn": "单词接龙",
            "slug": "word-ladder",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "字典树",
        "slug": "top-interview-150-14-gerx",
        "problems": [
          {
            "id": 208,
            "title": "Implement Trie (Prefix Tree)",
            "titleCn": "实现 Trie (前缀树)",
            "slug": "implement-trie-prefix-tree",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 211,
            "title": "Design Add and Search Words Data Structure",
            "titleCn": "添加与搜索单词 - 数据结构设计",
            "slug": "design-add-and-search-words-data-structure",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 212,
            "title": "Word Search II",
            "titleCn": "单词搜索 II",
            "slug": "word-search-ii",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "回溯",
        "slug": "top-interview-150-15-zwv4",
        "problems": [
          {
            "id": 17,
            "title": "Letter Combinations of a Phone Number",
            "titleCn": "电话号码的字母组合",
            "slug": "letter-combinations-of-a-phone-number",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 77,
            "title": "Combinations",
            "titleCn": "组合",
            "slug": "combinations",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 46,
            "title": "Permutations",
            "titleCn": "全排列",
            "slug": "permutations",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 39,
            "title": "Combination Sum",
            "titleCn": "组合总和",
            "slug": "combination-sum",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 52,
            "title": "N-Queens II",
            "titleCn": "N 皇后 II",
            "slug": "n-queens-ii",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 22,
            "title": "Generate Parentheses",
            "titleCn": "括号生成",
            "slug": "generate-parentheses",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 79,
            "title": "Word Search",
            "titleCn": "单词搜索",
            "slug": "word-search",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "分治",
        "slug": "top-interview-150-16-r7ol",
        "problems": [
          {
            "id": 108,
            "title": "Convert Sorted Array to Binary Search Tree",
            "titleCn": "将有序数组转换为二叉搜索树",
            "slug": "convert-sorted-array-to-binary-search-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 148,
            "title": "Sort List",
            "titleCn": "排序链表",
            "slug": "sort-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 427,
            "title": "Construct Quad Tree",
            "titleCn": "建立四叉树",
            "slug": "construct-quad-tree",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 23,
            "title": "Merge k Sorted Lists",
            "titleCn": "合并 K 个升序链表",
            "slug": "merge-k-sorted-lists",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "Kadane 算法",
        "slug": "top-interview-150-17-u2vz",
        "problems": [
          {
            "id": 53,
            "title": "Maximum Subarray",
            "titleCn": "最大子数组和",
            "slug": "maximum-subarray",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 918,
            "title": "Maximum Sum Circular Subarray",
            "titleCn": "环形子数组的最大和",
            "slug": "maximum-sum-circular-subarray",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二分查找",
        "slug": "top-interview-150-18-1ltq",
        "problems": [
          {
            "id": 35,
            "title": "Search Insert Position",
            "titleCn": "搜索插入位置",
            "slug": "search-insert-position",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 74,
            "title": "Search a 2D Matrix",
            "titleCn": "搜索二维矩阵",
            "slug": "search-a-2d-matrix",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 162,
            "title": "Find Peak Element",
            "titleCn": "寻找峰值",
            "slug": "find-peak-element",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 33,
            "title": "Search in Rotated Sorted Array",
            "titleCn": "搜索旋转排序数组",
            "slug": "search-in-rotated-sorted-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 34,
            "title": "Find First and Last Position of Element in Sorted Array",
            "titleCn": "在排序数组中查找元素的第一个和最后一个位置",
            "slug": "find-first-and-last-position-of-element-in-sorted-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 153,
            "title": "Find Minimum in Rotated Sorted Array",
            "titleCn": "寻找旋转排序数组中的最小值",
            "slug": "find-minimum-in-rotated-sorted-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 4,
            "title": "Median of Two Sorted Arrays",
            "titleCn": "寻找两个正序数组的中位数",
            "slug": "median-of-two-sorted-arrays",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "堆",
        "slug": "top-interview-150-19-8xvg",
        "problems": [
          {
            "id": 215,
            "title": "Kth Largest Element in an Array",
            "titleCn": "数组中的第K个最大元素",
            "slug": "kth-largest-element-in-an-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 502,
            "title": "IPO",
            "titleCn": "IPO",
            "slug": "ipo",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 373,
            "title": "Find K Pairs with Smallest Sums",
            "titleCn": "查找和最小的 K 对数字",
            "slug": "find-k-pairs-with-smallest-sums",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 295,
            "title": "Find Median from Data Stream",
            "titleCn": "数据流的中位数",
            "slug": "find-median-from-data-stream",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "位运算",
        "slug": "top-interview-150-20-7k1x",
        "problems": [
          {
            "id": 67,
            "title": "Add Binary",
            "titleCn": "二进制求和",
            "slug": "add-binary",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 190,
            "title": "Reverse Bits",
            "titleCn": "颠倒二进制位",
            "slug": "reverse-bits",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 191,
            "title": "Number of 1 Bits",
            "titleCn": "位1的个数",
            "slug": "number-of-1-bits",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 136,
            "title": "Single Number",
            "titleCn": "只出现一次的数字",
            "slug": "single-number",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 137,
            "title": "Single Number II",
            "titleCn": "只出现一次的数字 II",
            "slug": "single-number-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 201,
            "title": "Bitwise AND of Numbers Range",
            "titleCn": "数字范围按位与",
            "slug": "bitwise-and-of-numbers-range",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "数学",
        "slug": "top-interview-150-21-1xbc",
        "problems": [
          {
            "id": 9,
            "title": "Palindrome Number",
            "titleCn": "回文数",
            "slug": "palindrome-number",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 66,
            "title": "Plus One",
            "titleCn": "加一",
            "slug": "plus-one",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 172,
            "title": "Factorial Trailing Zeroes",
            "titleCn": "阶乘后的零",
            "slug": "factorial-trailing-zeroes",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 69,
            "title": "Sqrt(x)",
            "titleCn": "x 的平方根 ",
            "slug": "sqrtx",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 50,
            "title": "Pow(x, n)",
            "titleCn": "Pow(x, n)",
            "slug": "powx-n",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 149,
            "title": "Max Points on a Line",
            "titleCn": "直线上最多的点数",
            "slug": "max-points-on-a-line",
            "difficulty": "Hard",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "一维动态规划",
        "slug": "top-interview-150-22-ncbn",
        "problems": [
          {
            "id": 70,
            "title": "Climbing Stairs",
            "titleCn": "爬楼梯",
            "slug": "climbing-stairs",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 198,
            "title": "House Robber",
            "titleCn": "打家劫舍",
            "slug": "house-robber",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 139,
            "title": "Word Break",
            "titleCn": "单词拆分",
            "slug": "word-break",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 322,
            "title": "Coin Change",
            "titleCn": "零钱兑换",
            "slug": "coin-change",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 300,
            "title": "Longest Increasing Subsequence",
            "titleCn": "最长递增子序列",
            "slug": "longest-increasing-subsequence",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "多维动态规划",
        "slug": "top-interview-150-23-baen",
        "problems": [
          {
            "id": 120,
            "title": "Triangle",
            "titleCn": "三角形最小路径和",
            "slug": "triangle",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 64,
            "title": "Minimum Path Sum",
            "titleCn": "最小路径和",
            "slug": "minimum-path-sum",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 63,
            "title": "Unique Paths II",
            "titleCn": "不同路径 II",
            "slug": "unique-paths-ii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 5,
            "title": "Longest Palindromic Substring",
            "titleCn": "最长回文子串",
            "slug": "longest-palindromic-substring",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 97,
            "title": "Interleaving String",
            "titleCn": "交错字符串",
            "slug": "interleaving-string",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 72,
            "title": "Edit Distance",
            "titleCn": "编辑距离",
            "slug": "edit-distance",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 123,
            "title": "Best Time to Buy and Sell Stock III",
            "titleCn": "买卖股票的最佳时机 III",
            "slug": "best-time-to-buy-and-sell-stock-iii",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 188,
            "title": "Best Time to Buy and Sell Stock IV",
            "titleCn": "买卖股票的最佳时机 IV",
            "slug": "best-time-to-buy-and-sell-stock-iv",
            "difficulty": "Hard",
            "paidOnly": false
          },
          {
            "id": 221,
            "title": "Maximal Square",
            "titleCn": "最大正方形",
            "slug": "maximal-square",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      }
    ]
  },
  "leetcode-75": {
    "name": "LeetCode 75",
    "slug": "leetcode-75",
    "groups": [
      {
        "name": "数组 / 字符串",
        "slug": "leetcode-75-24-v7lc",
        "problems": [
          {
            "id": 1768,
            "title": "Merge Strings Alternately",
            "titleCn": "交替合并字符串",
            "slug": "merge-strings-alternately",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1071,
            "title": "Greatest Common Divisor of Strings",
            "titleCn": "字符串的最大公因子",
            "slug": "greatest-common-divisor-of-strings",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1431,
            "title": "Kids With the Greatest Number of Candies",
            "titleCn": "拥有最多糖果的孩子",
            "slug": "kids-with-the-greatest-number-of-candies",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 605,
            "title": "Can Place Flowers",
            "titleCn": "种花问题",
            "slug": "can-place-flowers",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 345,
            "title": "Reverse Vowels of a String",
            "titleCn": "反转字符串中的元音字母",
            "slug": "reverse-vowels-of-a-string",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 151,
            "title": "Reverse Words in a String",
            "titleCn": "反转字符串中的单词",
            "slug": "reverse-words-in-a-string",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 238,
            "title": "Product of Array Except Self",
            "titleCn": "除了自身以外数组的乘积",
            "slug": "product-of-array-except-self",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 334,
            "title": "Increasing Triplet Subsequence",
            "titleCn": "递增的三元子序列",
            "slug": "increasing-triplet-subsequence",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 443,
            "title": "String Compression",
            "titleCn": "压缩字符串",
            "slug": "string-compression",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "双指针",
        "slug": "leetcode-75-25-c0p1",
        "problems": [
          {
            "id": 283,
            "title": "Move Zeroes",
            "titleCn": "移动零",
            "slug": "move-zeroes",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 392,
            "title": "Is Subsequence",
            "titleCn": "判断子序列",
            "slug": "is-subsequence",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 11,
            "title": "Container With Most Water",
            "titleCn": "盛最多水的容器",
            "slug": "container-with-most-water",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1679,
            "title": "Max Number of K-Sum Pairs",
            "titleCn": "K 和数对的最大数目",
            "slug": "max-number-of-k-sum-pairs",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "滑动窗口",
        "slug": "leetcode-75-26-hx58",
        "problems": [
          {
            "id": 643,
            "title": "Maximum Average Subarray I",
            "titleCn": "子数组最大平均数 I",
            "slug": "maximum-average-subarray-i",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1456,
            "title": "Maximum Number of Vowels in a Substring of Given Length",
            "titleCn": "定长子串中元音的最大数目",
            "slug": "maximum-number-of-vowels-in-a-substring-of-given-length",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1004,
            "title": "Max Consecutive Ones III",
            "titleCn": "最大连续1的个数 III",
            "slug": "max-consecutive-ones-iii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1493,
            "title": "Longest Subarray of 1's After Deleting One Element",
            "titleCn": "删掉一个元素以后全为 1 的最长子数组",
            "slug": "longest-subarray-of-1s-after-deleting-one-element",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "前缀和",
        "slug": "leetcode-75-27-3f6e",
        "problems": [
          {
            "id": 1732,
            "title": "Find the Highest Altitude",
            "titleCn": "找到最高海拔",
            "slug": "find-the-highest-altitude",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 724,
            "title": "Find Pivot Index",
            "titleCn": "寻找数组的中心下标",
            "slug": "find-pivot-index",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "哈希表 / 哈希集合",
        "slug": "leetcode-75-28-da6t",
        "problems": [
          {
            "id": 2215,
            "title": "Find the Difference of Two Arrays",
            "titleCn": "找出两数组的不同",
            "slug": "find-the-difference-of-two-arrays",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1207,
            "title": "Unique Number of Occurrences",
            "titleCn": "独一无二的出现次数",
            "slug": "unique-number-of-occurrences",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1657,
            "title": "Determine if Two Strings Are Close",
            "titleCn": "确定两个字符串是否接近",
            "slug": "determine-if-two-strings-are-close",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2352,
            "title": "Equal Row and Column Pairs",
            "titleCn": "相等行列对",
            "slug": "equal-row-and-column-pairs",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "栈",
        "slug": "leetcode-75-29-x4dp",
        "problems": [
          {
            "id": 2390,
            "title": "Removing Stars From a String",
            "titleCn": "从字符串中移除星号",
            "slug": "removing-stars-from-a-string",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 735,
            "title": "Asteroid Collision",
            "titleCn": "小行星碰撞",
            "slug": "asteroid-collision",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 394,
            "title": "Decode String",
            "titleCn": "字符串解码",
            "slug": "decode-string",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "队列",
        "slug": "leetcode-75-30-ui21",
        "problems": [
          {
            "id": 933,
            "title": "Number of Recent Calls",
            "titleCn": "最近的请求次数",
            "slug": "number-of-recent-calls",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 649,
            "title": "Dota2 Senate",
            "titleCn": "Dota2 参议院",
            "slug": "dota2-senate",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "链表",
        "slug": "leetcode-75-31-sl6n",
        "problems": [
          {
            "id": 2095,
            "title": "Delete the Middle Node of a Linked List",
            "titleCn": "删除链表的中间节点",
            "slug": "delete-the-middle-node-of-a-linked-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 328,
            "title": "Odd Even Linked List",
            "titleCn": "奇偶链表",
            "slug": "odd-even-linked-list",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 206,
            "title": "Reverse Linked List",
            "titleCn": "反转链表",
            "slug": "reverse-linked-list",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2130,
            "title": "Maximum Twin Sum of a Linked List",
            "titleCn": "链表最大孪生和",
            "slug": "maximum-twin-sum-of-a-linked-list",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉树 - 深度优先搜索",
        "slug": "leetcode-75-32-v8gq",
        "problems": [
          {
            "id": 104,
            "title": "Maximum Depth of Binary Tree",
            "titleCn": "二叉树的最大深度",
            "slug": "maximum-depth-of-binary-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 872,
            "title": "Leaf-Similar Trees",
            "titleCn": "叶子相似的树",
            "slug": "leaf-similar-trees",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1448,
            "title": "Count Good Nodes in Binary Tree",
            "titleCn": "统计二叉树中好节点的数目",
            "slug": "count-good-nodes-in-binary-tree",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 437,
            "title": "Path Sum III",
            "titleCn": "路径总和 III",
            "slug": "path-sum-iii",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1372,
            "title": "Longest ZigZag Path in a Binary Tree",
            "titleCn": "二叉树中的最长交错路径",
            "slug": "longest-zigzag-path-in-a-binary-tree",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 236,
            "title": "Lowest Common Ancestor of a Binary Tree",
            "titleCn": "二叉树的最近公共祖先",
            "slug": "lowest-common-ancestor-of-a-binary-tree",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉树 - 广度优先搜索",
        "slug": "leetcode-75-33-cmsb",
        "problems": [
          {
            "id": 199,
            "title": "Binary Tree Right Side View",
            "titleCn": "二叉树的右视图",
            "slug": "binary-tree-right-side-view",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1161,
            "title": "Maximum Level Sum of a Binary Tree",
            "titleCn": "最大层内元素和",
            "slug": "maximum-level-sum-of-a-binary-tree",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉搜索树",
        "slug": "leetcode-75-34-rafk",
        "problems": [
          {
            "id": 700,
            "title": "Search in a Binary Search Tree",
            "titleCn": "二叉搜索树中的搜索",
            "slug": "search-in-a-binary-search-tree",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 450,
            "title": "Delete Node in a BST",
            "titleCn": "删除二叉搜索树中的节点",
            "slug": "delete-node-in-a-bst",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "图 - 深度优先搜索",
        "slug": "leetcode-75-35-4imk",
        "problems": [
          {
            "id": 841,
            "title": "Keys and Rooms",
            "titleCn": "钥匙和房间",
            "slug": "keys-and-rooms",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 547,
            "title": "Number of Provinces",
            "titleCn": "省份数量",
            "slug": "number-of-provinces",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1466,
            "title": "Reorder Routes to Make All Paths Lead to the City Zero",
            "titleCn": "重新规划路线",
            "slug": "reorder-routes-to-make-all-paths-lead-to-the-city-zero",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 399,
            "title": "Evaluate Division",
            "titleCn": "除法求值",
            "slug": "evaluate-division",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "图 - 广度优先搜索",
        "slug": "leetcode-75-36-go8q",
        "problems": [
          {
            "id": 1926,
            "title": "Nearest Exit from Entrance in Maze",
            "titleCn": "迷宫中离入口最近的出口",
            "slug": "nearest-exit-from-entrance-in-maze",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 994,
            "title": "Rotting Oranges",
            "titleCn": "腐烂的橘子",
            "slug": "rotting-oranges",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "堆 / 优先队列",
        "slug": "leetcode-75-37-yjql",
        "problems": [
          {
            "id": 215,
            "title": "Kth Largest Element in an Array",
            "titleCn": "数组中的第K个最大元素",
            "slug": "kth-largest-element-in-an-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2336,
            "title": "Smallest Number in Infinite Set",
            "titleCn": "无限集中的最小数字",
            "slug": "smallest-number-in-infinite-set",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2542,
            "title": "Maximum Subsequence Score",
            "titleCn": "最大子序列的分数",
            "slug": "maximum-subsequence-score",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2462,
            "title": "Total Cost to Hire K Workers",
            "titleCn": "雇佣 K 位工人的总代价",
            "slug": "total-cost-to-hire-k-workers",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二分查找",
        "slug": "leetcode-75-38-al5e",
        "problems": [
          {
            "id": 374,
            "title": "Guess Number Higher or Lower",
            "titleCn": "猜数字大小",
            "slug": "guess-number-higher-or-lower",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2300,
            "title": "Successful Pairs of Spells and Potions",
            "titleCn": "咒语和药水的成功对数",
            "slug": "successful-pairs-of-spells-and-potions",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 162,
            "title": "Find Peak Element",
            "titleCn": "寻找峰值",
            "slug": "find-peak-element",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 875,
            "title": "Koko Eating Bananas",
            "titleCn": "爱吃香蕉的珂珂",
            "slug": "koko-eating-bananas",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "回溯",
        "slug": "leetcode-75-39-u6wn",
        "problems": [
          {
            "id": 17,
            "title": "Letter Combinations of a Phone Number",
            "titleCn": "电话号码的字母组合",
            "slug": "letter-combinations-of-a-phone-number",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 216,
            "title": "Combination Sum III",
            "titleCn": "组合总和 III",
            "slug": "combination-sum-iii",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "动态规划 - 一维",
        "slug": "leetcode-75-40-ja5z",
        "problems": [
          {
            "id": 1137,
            "title": "N-th Tribonacci Number",
            "titleCn": "第 N 个泰波那契数",
            "slug": "n-th-tribonacci-number",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 746,
            "title": "Min Cost Climbing Stairs",
            "titleCn": "使用最小花费爬楼梯",
            "slug": "min-cost-climbing-stairs",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 198,
            "title": "House Robber",
            "titleCn": "打家劫舍",
            "slug": "house-robber",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 790,
            "title": "Domino and Tromino Tiling",
            "titleCn": "多米诺和托米诺平铺",
            "slug": "domino-and-tromino-tiling",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "动态规划 - 多维",
        "slug": "leetcode-75-41-qkrl",
        "problems": [
          {
            "id": 62,
            "title": "Unique Paths",
            "titleCn": "不同路径",
            "slug": "unique-paths",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1143,
            "title": "Longest Common Subsequence",
            "titleCn": "最长公共子序列",
            "slug": "longest-common-subsequence",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 714,
            "title": "Best Time to Buy and Sell Stock with Transaction Fee",
            "titleCn": "买卖股票的最佳时机含手续费",
            "slug": "best-time-to-buy-and-sell-stock-with-transaction-fee",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 72,
            "title": "Edit Distance",
            "titleCn": "编辑距离",
            "slug": "edit-distance",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "位运算",
        "slug": "leetcode-75-42-5hpq",
        "problems": [
          {
            "id": 338,
            "title": "Counting Bits",
            "titleCn": "比特位计数",
            "slug": "counting-bits",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 136,
            "title": "Single Number",
            "titleCn": "只出现一次的数字",
            "slug": "single-number",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1318,
            "title": "Minimum Flips to Make a OR b Equal to c",
            "titleCn": "或运算的最小翻转次数",
            "slug": "minimum-flips-to-make-a-or-b-equal-to-c",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "前缀树",
        "slug": "leetcode-75-43-ruld",
        "problems": [
          {
            "id": 208,
            "title": "Implement Trie (Prefix Tree)",
            "titleCn": "实现 Trie (前缀树)",
            "slug": "implement-trie-prefix-tree",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 1268,
            "title": "Search Suggestions System",
            "titleCn": "搜索推荐系统",
            "slug": "search-suggestions-system",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "区间集合",
        "slug": "leetcode-75-44-y5z9",
        "problems": [
          {
            "id": 435,
            "title": "Non-overlapping Intervals",
            "titleCn": "无重叠区间",
            "slug": "non-overlapping-intervals",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 452,
            "title": "Minimum Number of Arrows to Burst Balloons",
            "titleCn": "用最少数量的箭引爆气球",
            "slug": "minimum-number-of-arrows-to-burst-balloons",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "单调栈",
        "slug": "leetcode-75-45-77mb",
        "problems": [
          {
            "id": 739,
            "title": "Daily Temperatures",
            "titleCn": "每日温度",
            "slug": "daily-temperatures",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 901,
            "title": "Online Stock Span",
            "titleCn": "股票价格跨度",
            "slug": "online-stock-span",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      }
    ]
  },
  "introduction-to-pandas": {
    "name": "Pandas 入门 15 题",
    "slug": "introduction-to-pandas",
    "groups": [
      {
        "name": "Pandas 数据结构",
        "slug": "introduction-to-pandas-349-fz02",
        "problems": [
          {
            "id": 2877,
            "title": "Create a DataFrame from List",
            "titleCn": "从表中创建 DataFrame",
            "slug": "create-a-dataframe-from-list",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "数据检验",
        "slug": "introduction-to-pandas-350-n08c",
        "problems": [
          {
            "id": 2878,
            "title": "Get the Size of a DataFrame",
            "titleCn": "获取 DataFrame 的大小",
            "slug": "get-the-size-of-a-dataframe",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2879,
            "title": "Display the First Three Rows",
            "titleCn": "显示前三行",
            "slug": "display-the-first-three-rows",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "数据选取",
        "slug": "introduction-to-pandas-351-82gs",
        "problems": [
          {
            "id": 2880,
            "title": "Select Data",
            "titleCn": "数据选取",
            "slug": "select-data",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2881,
            "title": "Create a New Column",
            "titleCn": "创建新列",
            "slug": "create-a-new-column",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "数据清理",
        "slug": "introduction-to-pandas-352-nfi2",
        "problems": [
          {
            "id": 2882,
            "title": "Drop Duplicate Rows",
            "titleCn": "删去重复的行",
            "slug": "drop-duplicate-rows",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2883,
            "title": "Drop Missing Data",
            "titleCn": "删去丢失的数据",
            "slug": "drop-missing-data",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2884,
            "title": "Modify Columns",
            "titleCn": "修改列",
            "slug": "modify-columns",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2885,
            "title": "Rename Columns",
            "titleCn": "重命名列",
            "slug": "rename-columns",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2886,
            "title": "Change Data Type",
            "titleCn": "改变数据类型",
            "slug": "change-data-type",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2887,
            "title": "Fill Missing Data",
            "titleCn": "填充缺失值",
            "slug": "fill-missing-data",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "表格重塑",
        "slug": "introduction-to-pandas-353-ixqj",
        "problems": [
          {
            "id": 2888,
            "title": "Reshape Data: Concatenate",
            "titleCn": "重塑数据：连结",
            "slug": "reshape-data-concatenate",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2889,
            "title": "Reshape Data: Pivot",
            "titleCn": "数据重塑：透视",
            "slug": "reshape-data-pivot",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2890,
            "title": "Reshape Data: Melt",
            "titleCn": "重塑数据：融合",
            "slug": "reshape-data-melt",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "高级技巧",
        "slug": "introduction-to-pandas-354-7fom",
        "problems": [
          {
            "id": 2891,
            "title": "Method Chaining",
            "titleCn": "方法链",
            "slug": "method-chaining",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      }
    ]
  },
  "30-days-of-javascript": {
    "name": "30 天 JavaScript 挑战",
    "slug": "30-days-of-javascript",
    "groups": [
      {
        "name": "闭包",
        "slug": "30-days-of-javascript-closures",
        "problems": [
          {
            "id": 2667,
            "title": "Create Hello World Function",
            "titleCn": "创建 Hello World 函数",
            "slug": "create-hello-world-function",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2620,
            "title": "Counter",
            "titleCn": "计数器",
            "slug": "counter",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2704,
            "title": "To Be Or Not To Be",
            "titleCn": "相等还是不相等",
            "slug": "to-be-or-not-to-be",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2665,
            "title": "Counter II",
            "titleCn": "计数器 II",
            "slug": "counter-ii",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "基本数组转换",
        "slug": "30-days-of-javascript-basic-array-transformations",
        "problems": [
          {
            "id": 2635,
            "title": "Apply Transform Over Each Element in Array",
            "titleCn": "转换数组中的每个元素",
            "slug": "apply-transform-over-each-element-in-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2634,
            "title": "Filter Elements from Array",
            "titleCn": "过滤数组中的元素",
            "slug": "filter-elements-from-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2626,
            "title": "Array Reduce Transformation",
            "titleCn": "数组归约运算",
            "slug": "array-reduce-transformation",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "函数转换",
        "slug": "30-days-of-javascript-function-transformations",
        "problems": [
          {
            "id": 2629,
            "title": "Function Composition",
            "titleCn": "复合函数",
            "slug": "function-composition",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2703,
            "title": "Return Length of Arguments Passed",
            "titleCn": "返回传递的参数的长度",
            "slug": "return-length-of-arguments-passed",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2666,
            "title": "Allow One Function Call",
            "titleCn": "只允许一次函数调用",
            "slug": "allow-one-function-call",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2623,
            "title": "Memoize",
            "titleCn": "记忆函数",
            "slug": "memoize",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "Promises 和 Time",
        "slug": "30-days-of-javascript-promises-and-time",
        "problems": [
          {
            "id": 2723,
            "title": "Add Two Promises",
            "titleCn": "两个 Promise 对象相加",
            "slug": "add-two-promises",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2621,
            "title": "Sleep",
            "titleCn": "睡眠函数",
            "slug": "sleep",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2715,
            "title": "Timeout Cancellation",
            "titleCn": "执行可取消的延迟函数",
            "slug": "timeout-cancellation",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2725,
            "title": "Interval Cancellation",
            "titleCn": "间隔取消",
            "slug": "interval-cancellation",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2637,
            "title": "Promise Time Limit",
            "titleCn": "有时间限制的 Promise 对象",
            "slug": "promise-time-limit",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2622,
            "title": "Cache With Time Limit",
            "titleCn": "有时间限制的缓存",
            "slug": "cache-with-time-limit",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2627,
            "title": "Debounce",
            "titleCn": "函数防抖",
            "slug": "debounce",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2721,
            "title": "Execute Asynchronous Functions in Parallel",
            "titleCn": "并行执行异步函数",
            "slug": "execute-asynchronous-functions-in-parallel",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "JSON",
        "slug": "30-days-of-javascript-json",
        "problems": [
          {
            "id": 2727,
            "title": "Is Object Empty",
            "titleCn": "判断对象是否为空",
            "slug": "is-object-empty",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2677,
            "title": "Chunk Array",
            "titleCn": "分块数组",
            "slug": "chunk-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2619,
            "title": "Array Prototype Last",
            "titleCn": "数组原型对象的最后一个元素",
            "slug": "array-prototype-last",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2631,
            "title": "Group By",
            "titleCn": "分组",
            "slug": "group-by",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2724,
            "title": "Sort By",
            "titleCn": "排序方式",
            "slug": "sort-by",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2722,
            "title": "Join Two Arrays by ID",
            "titleCn": "根据 ID 合并两个数组",
            "slug": "join-two-arrays-by-id",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2625,
            "title": "Flatten Deeply Nested Array",
            "titleCn": "扁平化嵌套数组",
            "slug": "flatten-deeply-nested-array",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2705,
            "title": "Compact Object",
            "titleCn": "精简对象",
            "slug": "compact-object",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "类",
        "slug": "30-days-of-javascript-classes",
        "problems": [
          {
            "id": 2694,
            "title": "Event Emitter",
            "titleCn": "事件发射器",
            "slug": "event-emitter",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 2695,
            "title": "Array Wrapper",
            "titleCn": "包装数组",
            "slug": "array-wrapper",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2726,
            "title": "Calculator with Method Chaining",
            "titleCn": "使用方法链的计算器",
            "slug": "calculator-with-method-chaining",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "总结你的 30 天旅程，附带奖励挑战!",
        "slug": "30-days-of-javascript-bonus-challenges",
        "problems": []
      }
    ]
  },
  "programming-skills": {
    "name": "编程基础 0 到 1",
    "slug": "programming-skills",
    "groups": [
      {
        "name": "基础实现",
        "slug": "programming-skills-165-m0cj",
        "problems": [
          {
            "id": 1768,
            "title": "Merge Strings Alternately",
            "titleCn": "交替合并字符串",
            "slug": "merge-strings-alternately",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 389,
            "title": "Find the Difference",
            "titleCn": "找不同",
            "slug": "find-the-difference",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 28,
            "title": "Find the Index of the First Occurrence in a String",
            "titleCn": "找出字符串中第一个匹配项的下标",
            "slug": "find-the-index-of-the-first-occurrence-in-a-string",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 242,
            "title": "Valid Anagram",
            "titleCn": "有效的字母异位词",
            "slug": "valid-anagram",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 459,
            "title": "Repeated Substring Pattern",
            "titleCn": "重复的子字符串",
            "slug": "repeated-substring-pattern",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 283,
            "title": "Move Zeroes",
            "titleCn": "移动零",
            "slug": "move-zeroes",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 66,
            "title": "Plus One",
            "titleCn": "加一",
            "slug": "plus-one",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1822,
            "title": "Sign of the Product of an Array",
            "titleCn": "数组元素积的符号",
            "slug": "sign-of-the-product-of-an-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1502,
            "title": "Can Make Arithmetic Progression From Sequence",
            "titleCn": "判断能否形成等差数列",
            "slug": "can-make-arithmetic-progression-from-sequence",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 896,
            "title": "Monotonic Array",
            "titleCn": "单调数列",
            "slug": "monotonic-array",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 13,
            "title": "Roman to Integer",
            "titleCn": "罗马数字转整数",
            "slug": "roman-to-integer",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "内置函数",
        "slug": "programming-skills-255-wvv9",
        "problems": [
          {
            "id": 58,
            "title": "Length of Last Word",
            "titleCn": "最后一个单词的长度",
            "slug": "length-of-last-word",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 709,
            "title": "To Lower Case",
            "titleCn": "转换成小写字母",
            "slug": "to-lower-case",
            "difficulty": "Easy",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "模拟",
        "slug": "programming-skills-256-ihoo",
        "problems": [
          {
            "id": 682,
            "title": "Baseball Game",
            "titleCn": "棒球比赛",
            "slug": "baseball-game",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 657,
            "title": "Robot Return to Origin",
            "titleCn": "机器人能否返回原点",
            "slug": "robot-return-to-origin",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1275,
            "title": "Find Winner on a Tic Tac Toe Game",
            "titleCn": "找出井字棋的获胜者",
            "slug": "find-winner-on-a-tic-tac-toe-game",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1041,
            "title": "Robot Bounded In Circle",
            "titleCn": "困于环中的机器人",
            "slug": "robot-bounded-in-circle",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "矩阵",
        "slug": "programming-skills-166-golg",
        "problems": [
          {
            "id": 1672,
            "title": "Richest Customer Wealth",
            "titleCn": "最富有客户的资产总量",
            "slug": "richest-customer-wealth",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1572,
            "title": "Matrix Diagonal Sum",
            "titleCn": "矩阵对角线元素的和",
            "slug": "matrix-diagonal-sum",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 54,
            "title": "Spiral Matrix",
            "titleCn": "螺旋矩阵",
            "slug": "spiral-matrix",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 73,
            "title": "Set Matrix Zeroes",
            "titleCn": "矩阵置零",
            "slug": "set-matrix-zeroes",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "数学",
        "slug": "programming-skills-167-6tzl",
        "problems": [
          {
            "id": 1523,
            "title": "Count Odd Numbers in an Interval Range",
            "titleCn": "在区间范围内统计奇数数目",
            "slug": "count-odd-numbers-in-an-interval-range",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1491,
            "title": "Average Salary Excluding the Minimum and Maximum Salary",
            "titleCn": "去掉最低工资和最高工资后的工资平均值",
            "slug": "average-salary-excluding-the-minimum-and-maximum-salary",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 860,
            "title": "Lemonade Change",
            "titleCn": "柠檬水找零",
            "slug": "lemonade-change",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 976,
            "title": "Largest Perimeter Triangle",
            "titleCn": "三角形的最大周长",
            "slug": "largest-perimeter-triangle",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 1232,
            "title": "Check If It Is a Straight Line",
            "titleCn": "缀点成线",
            "slug": "check-if-it-is-a-straight-line",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 67,
            "title": "Add Binary",
            "titleCn": "二进制求和",
            "slug": "add-binary",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 43,
            "title": "Multiply Strings",
            "titleCn": "字符串相乘",
            "slug": "multiply-strings",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 50,
            "title": "Pow(x, n)",
            "titleCn": "Pow(x, n)",
            "slug": "powx-n",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "链表",
        "slug": "programming-skills-168-8zsj",
        "problems": [
          {
            "id": 21,
            "title": "Merge Two Sorted Lists",
            "titleCn": "合并两个有序链表",
            "slug": "merge-two-sorted-lists",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 206,
            "title": "Reverse Linked List",
            "titleCn": "反转链表",
            "slug": "reverse-linked-list",
            "difficulty": "Easy",
            "paidOnly": false
          },
          {
            "id": 2,
            "title": "Add Two Numbers",
            "titleCn": "两数相加",
            "slug": "add-two-numbers",
            "difficulty": "Medium",
            "paidOnly": false
          },
          {
            "id": 445,
            "title": "Add Two Numbers II",
            "titleCn": "两数相加 II",
            "slug": "add-two-numbers-ii",
            "difficulty": "Medium",
            "paidOnly": false
          }
        ]
      },
      {
        "name": "二叉树",
        "slug": "programming-skills-170-l364",
        "problems": []
      },
      {
        "name": "设计模式",
        "slug": "programming-skills-169-zc4g",
        "problems": []
      },
      {
        "name": "复杂实现",
        "slug": "programming-skills-255-udlq",
        "problems": []
      }
    ]
  }
};
