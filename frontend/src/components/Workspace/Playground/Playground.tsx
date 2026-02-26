import { useState, useEffect, useMemo, useRef } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python, pythonLanguage, globalCompletion, localCompletionSource } from "@codemirror/lang-python";
import { cpp, cppLanguage } from "@codemirror/lang-cpp";
import { indentService, indentUnit, syntaxTree } from "@codemirror/language";
import { keymap, EditorView } from "@codemirror/view";
import { java, javaLanguage } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { Extension } from "@codemirror/state";
import {
	autocompletion,
	CompletionContext,
	CompletionResult,
	snippetCompletion,
} from "@codemirror/autocomplete";
import EditorFooter from "./EditorFooter";
import JudgeResultPanel from "@/components/JudgeResultPanel/JudgeResultPanel";
import SubmissionHistory, { SubmissionRecord } from "@/components/SubmissionHistory/SubmissionHistory";
import { Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { problems } from "@/utils/problems";
import { useRouter } from "next/router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import useLocalStorage from "@/hooks/useLocalStorage";

type PlaygroundProps = {
	problem: Problem;
	setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
	setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface ISettings {
	fontSize: string;
	settingsModalIsOpen: boolean;
	dropdownIsOpen: boolean;
}

type RunResultState = {
	status: string;
	stdout: string;
	stderr: string;
	runtime_ms: number;
} | null;

type JudgeResultState = {
	status: string;
	passed: number;
	total: number;
	runtime_ms: number;
	failed_case?: {
		index: number;
		input?: string;
		expected?: string;
		actual?: string;
	};
} | null;

// Maps lowercase DB keys to display names
const LANG_DISPLAY: Record<string, string> = {
	javascript: "JavaScript",
	typescript: "TypeScript",
	python3: "Python3",
	python: "Python",
	cpp: "C++",
	c: "C",
	java: "Java",
	csharp: "C#",
	go: "Go",
	kotlin: "Kotlin",
	swift: "Swift",
	rust: "Rust",
	ruby: "Ruby",
	php: "PHP",
	dart: "Dart",
	scala: "Scala",
	elixir: "Elixir",
	erlang: "Erlang",
	racket: "Racket",
};

// Maps display name back to DB key
const LANG_TO_KEY: Record<string, string> = Object.fromEntries(
	Object.entries(LANG_DISPLAY).map(([k, v]) => [v, k])
);

// ── Static completion tables ──────────────────────────────────────────────────
// Kept as module-level constants so they are allocated once, not per keystroke.

// C++ — methods shown after `.` or `->`
const CPP_MEMBER_OPTIONS = [
	// Universal container methods
	snippetCompletion("size()", { label: "size", type: "method", info: "→ size_t", detail: "element count" }),
	snippetCompletion("empty()", { label: "empty", type: "method", info: "→ bool", detail: "true if no elements" }),
	snippetCompletion("clear()", { label: "clear", type: "method", detail: "remove all elements" }),
	snippetCompletion("begin()", { label: "begin", type: "method", info: "→ iterator" }),
	snippetCompletion("end()", { label: "end", type: "method", info: "→ iterator" }),
	snippetCompletion("rbegin()", { label: "rbegin", type: "method", info: "→ reverse_iterator" }),
	snippetCompletion("rend()", { label: "rend", type: "method", info: "→ reverse_iterator" }),
	// Sequence containers (vector / deque / list)
	snippetCompletion("push_back(${value})", { label: "push_back", type: "method", detail: "append element to end" }),
	snippetCompletion("pop_back()", { label: "pop_back", type: "method", detail: "remove last element" }),
	snippetCompletion("push_front(${value})", { label: "push_front", type: "method", detail: "prepend element (deque/list)" }),
	snippetCompletion("pop_front()", { label: "pop_front", type: "method", detail: "remove first element (deque/list)" }),
	snippetCompletion("front()", { label: "front", type: "method", info: "→ reference", detail: "first element" }),
	snippetCompletion("back()", { label: "back", type: "method", info: "→ reference", detail: "last element" }),
	snippetCompletion("at(${i})", { label: "at", type: "method", info: "→ reference", detail: "element with bounds check" }),
	snippetCompletion("resize(${n})", { label: "resize", type: "method", detail: "resize container" }),
	snippetCompletion("reserve(${n})", { label: "reserve", type: "method", detail: "preallocate capacity (vector)" }),
	snippetCompletion("insert(${pos}, ${value})", { label: "insert", type: "method", detail: "insert element(s)" }),
	snippetCompletion("erase(${pos})", { label: "erase", type: "method", detail: "erase element(s)" }),
	snippetCompletion("emplace_back(${args})", { label: "emplace_back", type: "method", detail: "construct & append in-place" }),
	snippetCompletion("assign(${n}, ${value})", { label: "assign", type: "method", detail: "replace contents" }),
	// Associative containers (map / unordered_map / set / unordered_set)
	snippetCompletion("find(${key})", { label: "find", type: "method", info: "→ iterator", detail: "find by key; end() if absent" }),
	snippetCompletion("count(${key})", { label: "count", type: "method", info: "→ size_t", detail: "number of matching keys" }),
	snippetCompletion("contains(${key})", { label: "contains", type: "method", info: "→ bool (C++20)", detail: "check if key exists" }),
	snippetCompletion("emplace(${args})", { label: "emplace", type: "method", detail: "construct & insert in-place" }),
	snippetCompletion("lower_bound(${key})", { label: "lower_bound", type: "method", info: "→ iterator", detail: "first >= key (ordered containers)" }),
	snippetCompletion("upper_bound(${key})", { label: "upper_bound", type: "method", info: "→ iterator", detail: "first > key (ordered containers)" }),
	// Stack / queue / priority_queue
	snippetCompletion("push(${value})", { label: "push", type: "method", detail: "add element" }),
	snippetCompletion("pop()", { label: "pop", type: "method", detail: "remove top/front element" }),
	snippetCompletion("top()", { label: "top", type: "method", info: "→ reference", detail: "top element (stack)" }),
	// String-specific
	snippetCompletion("length()", { label: "length", type: "method", info: "→ size_t", detail: "same as size()" }),
	snippetCompletion("substr(${pos}, ${len})", { label: "substr", type: "method", info: "→ string", detail: "extract substring" }),
	snippetCompletion("replace(${pos}, ${len}, ${str})", { label: "replace", type: "method", detail: "replace portion of string" }),
	snippetCompletion("c_str()", { label: "c_str", type: "method", info: "→ const char*" }),
	snippetCompletion("append(${str})", { label: "append", type: "method" }),
	snippetCompletion("rfind(${str})", { label: "rfind", type: "method", info: "→ size_t", detail: "reverse find" }),
	snippetCompletion("compare(${str})", { label: "compare", type: "method", info: "→ int" }),
	// pair members
	{ label: "first",  type: "property", detail: "first element of pair" },
	{ label: "second", type: "property", detail: "second element of pair" },
];

// C++ — types / algorithms / utilities shown on normal word completion
const CPP_GENERAL_OPTIONS = [
	// Container types
	{ label: "vector",         type: "class", info: "std::vector<T>" },
	{ label: "unordered_map",  type: "class", info: "std::unordered_map<K,V> O(1) avg" },
	{ label: "unordered_set",  type: "class", info: "std::unordered_set<T> O(1) avg" },
	{ label: "map",            type: "class", info: "std::map<K,V> ordered, O(log n)" },
	{ label: "set",            type: "class", info: "std::set<T> ordered, O(log n)" },
	{ label: "multimap",       type: "class" },
	{ label: "multiset",       type: "class" },
	{ label: "stack",          type: "class", info: "LIFO adapter" },
	{ label: "queue",          type: "class", info: "FIFO adapter" },
	{ label: "priority_queue", type: "class", info: "max-heap by default" },
	{ label: "deque",          type: "class", info: "double-ended queue" },
	{ label: "list",           type: "class", info: "doubly-linked list" },
	{ label: "string",         type: "class" },
	{ label: "pair",           type: "class", info: "std::pair<F,S>" },
	{ label: "tuple",          type: "class", info: "std::tuple<Ts…>" },
	{ label: "optional",       type: "class", info: "std::optional<T> (C++17)" },
	// Algorithms
	{ label: "sort",             type: "function", info: "sort(first, last [, comp])" },
	{ label: "stable_sort",      type: "function" },
	{ label: "binary_search",    type: "function", info: "→ bool" },
	{ label: "lower_bound",      type: "function", info: "first ≥ value → iterator" },
	{ label: "upper_bound",      type: "function", info: "first > value → iterator" },
	{ label: "max_element",      type: "function" },
	{ label: "min_element",      type: "function" },
	{ label: "reverse",          type: "function" },
	{ label: "accumulate",       type: "function", info: "accumulate(first, last, init)" },
	{ label: "find",             type: "function" },
	{ label: "find_if",          type: "function" },
	{ label: "count",            type: "function" },
	{ label: "count_if",         type: "function" },
	{ label: "unique",           type: "function", info: "remove consecutive duplicates" },
	{ label: "fill",             type: "function" },
	{ label: "fill_n",           type: "function" },
	{ label: "next_permutation", type: "function" },
	{ label: "nth_element",      type: "function" },
	{ label: "partial_sort",     type: "function" },
	{ label: "iota",             type: "function", info: "fill with incrementing values" },
	{ label: "transform",        type: "function" },
	{ label: "remove_if",        type: "function" },
	{ label: "all_of",           type: "function" },
	{ label: "any_of",           type: "function" },
	{ label: "none_of",          type: "function" },
	{ label: "merge",            type: "function" },
	{ label: "rotate",           type: "function" },
	{ label: "copy",             type: "function" },
	// Utilities
	{ label: "make_pair",   type: "function" },
	{ label: "make_tuple",  type: "function" },
	{ label: "get",         type: "function", info: "get<I>(tuple)" },
	{ label: "swap",        type: "function" },
	{ label: "move",        type: "function" },
	{ label: "abs",         type: "function" },
	{ label: "max",         type: "function" },
	{ label: "min",         type: "function" },
	{ label: "pow",         type: "function" },
	{ label: "sqrt",        type: "function" },
	{ label: "log",         type: "function" },
	{ label: "log2",        type: "function" },
	{ label: "ceil",        type: "function" },
	{ label: "floor",       type: "function" },
	{ label: "gcd",         type: "function", info: "std::gcd (C++17)" },
	{ label: "lcm",         type: "function", info: "std::lcm (C++17)" },
	{ label: "to_string",   type: "function", info: "→ std::string" },
	{ label: "stoi",        type: "function", info: "string → int" },
	{ label: "stoll",       type: "function", info: "string → long long" },
	{ label: "stod",        type: "function", info: "string → double" },
	// Constants
	{ label: "INT_MAX",      type: "constant", info: "2 147 483 647" },
	{ label: "INT_MIN",      type: "constant", info: "-2 147 483 648" },
	{ label: "LLONG_MAX",    type: "constant" },
	{ label: "LLONG_MIN",    type: "constant" },
	{ label: "LONG_MAX",     type: "constant" },
	{ label: "DBL_MAX",      type: "constant" },
	{ label: "string::npos", type: "constant", info: "= SIZE_MAX — 'not found' sentinel" },
	// Keywords / types
	{ label: "auto",    type: "keyword" },
	{ label: "nullptr", type: "keyword" },
	{ label: "true",    type: "keyword" },
	{ label: "false",   type: "keyword" },
	{ label: "size_t",  type: "type" },
	// Snippets — boost: 2 floats them to the top
	snippetCompletion("for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}", {
		label: "for-i", type: "keyword", detail: "index for loop", boost: 2,
	}),
	snippetCompletion("for (auto& ${x} : ${container}) {\n\t${}\n}", {
		label: "for-range", type: "keyword", detail: "range-based for", boost: 2,
	}),
	snippetCompletion("if (${condition}) {\n\t${}\n}", {
		label: "if", type: "keyword", detail: "if statement", boost: 2,
	}),
	snippetCompletion("while (${condition}) {\n\t${}\n}", {
		label: "while", type: "keyword", detail: "while loop", boost: 2,
	}),
	snippetCompletion("sort(${v}.begin(), ${v}.end());", {
		label: "sort-vec", type: "function", detail: "sort a vector", boost: 1,
	}),
	snippetCompletion("sort(${v}.begin(), ${v}.end(), [](const auto& a, const auto& b){\n\treturn ${a < b};\n});", {
		label: "sort-custom", type: "function", detail: "sort with custom comparator", boost: 1,
	}),
	snippetCompletion("vector<${int}> ${name}(${n}, ${0});", {
		label: "vector-init", type: "class", detail: "vector pre-filled with value", boost: 1,
	}),
	snippetCompletion("vector<vector<${int}>> ${dp}(${m} + 1, vector<${int}>(${n} + 1, ${0}));", {
		label: "dp-2d", type: "class", detail: "2-D DP table", boost: 1,
	}),
	snippetCompletion("unordered_map<${string}, ${int}> ${mp};", {
		label: "umap", type: "class", detail: "unordered_map", boost: 1,
	}),
	snippetCompletion("auto it = ${mp}.find(${key});\nif (it != ${mp}.end()) {\n\t${it->second}\n}", {
		label: "map-find", type: "function", detail: "safe map lookup", boost: 1,
	}),
	snippetCompletion("priority_queue<${int}, vector<${int}>, greater<${int}>> ${pq};", {
		label: "min-heap", type: "class", detail: "min-heap priority queue", boost: 1,
	}),
	snippetCompletion("int ${l} = 0, ${r} = ${n} - 1;\nwhile (${l} <= ${r}) {\n\tint ${mid} = ${l} + (${r} - ${l}) / 2;\n\tif (${nums}[${mid}] == ${target}) return ${mid};\n\telse if (${nums}[${mid}] < ${target}) ${l} = ${mid} + 1;\n\telse ${r} = ${mid} - 1;\n}\nreturn -1;", {
		label: "binary-search", type: "keyword", detail: "binary search template", boost: 1,
	}),
];

// Java — methods shown after `.`
const JAVA_MEMBER_OPTIONS = [
	// Collection methods
	snippetCompletion("size()", { label: "size", type: "method", info: "→ int" }),
	snippetCompletion("isEmpty()", { label: "isEmpty", type: "method", info: "→ boolean" }),
	snippetCompletion("add(${element})", { label: "add", type: "method", detail: "add element" }),
	snippetCompletion("get(${index})", { label: "get", type: "method", info: "→ E" }),
	snippetCompletion("set(${index}, ${element})", { label: "set", type: "method" }),
	snippetCompletion("remove(${index})", { label: "remove", type: "method" }),
	snippetCompletion("contains(${element})", { label: "contains", type: "method", info: "→ boolean" }),
	snippetCompletion("indexOf(${element})", { label: "indexOf", type: "method", info: "→ int" }),
	snippetCompletion("clear()", { label: "clear", type: "method" }),
	snippetCompletion("addAll(${collection})", { label: "addAll", type: "method" }),
	snippetCompletion("subList(${from}, ${to})", { label: "subList", type: "method", info: "→ List<E>" }),
	snippetCompletion("iterator()", { label: "iterator", type: "method", info: "→ Iterator<E>" }),
	snippetCompletion("toArray()", { label: "toArray", type: "method", info: "→ Object[]" }),
	// Map-specific
	snippetCompletion("put(${key}, ${value})", { label: "put", type: "method" }),
	snippetCompletion("getOrDefault(${key}, ${defaultValue})", { label: "getOrDefault", type: "method" }),
	snippetCompletion("containsKey(${key})", { label: "containsKey", type: "method", info: "→ boolean" }),
	snippetCompletion("containsValue(${value})", { label: "containsValue", type: "method", info: "→ boolean" }),
	snippetCompletion("keySet()", { label: "keySet", type: "method", info: "→ Set<K>" }),
	snippetCompletion("values()", { label: "values", type: "method", info: "→ Collection<V>" }),
	snippetCompletion("entrySet()", { label: "entrySet", type: "method", info: "→ Set<Map.Entry<K,V>>" }),
	snippetCompletion("merge(${key}, ${value}, ${remappingFn})", { label: "merge", type: "method" }),
	snippetCompletion("computeIfAbsent(${key}, ${mappingFn})", { label: "computeIfAbsent", type: "method" }),
	snippetCompletion("putIfAbsent(${key}, ${value})", { label: "putIfAbsent", type: "method" }),
	// Stack / Deque / Queue
	snippetCompletion("push(${element})", { label: "push", type: "method" }),
	snippetCompletion("pop()", { label: "pop", type: "method" }),
	snippetCompletion("peek()", { label: "peek", type: "method", detail: "top without removing" }),
	snippetCompletion("poll()", { label: "poll", type: "method", detail: "retrieve and remove head" }),
	snippetCompletion("offer(${element})", { label: "offer", type: "method", detail: "add element (queue)" }),
	// String-specific
	snippetCompletion("length()", { label: "length", type: "method", info: "→ int" }),
	snippetCompletion("charAt(${index})", { label: "charAt", type: "method", info: "→ char" }),
	snippetCompletion("substring(${start}, ${end})", { label: "substring", type: "method", info: "→ String" }),
	snippetCompletion("indexOf(${str})", { label: "indexOf", type: "method", info: "→ int" }),
	snippetCompletion("equals(${other})", { label: "equals", type: "method", info: "→ boolean" }),
	snippetCompletion("equalsIgnoreCase(${other})", { label: "equalsIgnoreCase", type: "method" }),
	snippetCompletion("toCharArray()", { label: "toCharArray", type: "method", info: "→ char[]" }),
	snippetCompletion("split(${regex})", { label: "split", type: "method", info: "→ String[]" }),
	snippetCompletion("trim()", { label: "trim", type: "method", info: "→ String" }),
	snippetCompletion("toLowerCase()", { label: "toLowerCase", type: "method" }),
	snippetCompletion("toUpperCase()", { label: "toUpperCase", type: "method" }),
	snippetCompletion("replace(${old}, ${new})", { label: "replace", type: "method" }),
	snippetCompletion("startsWith(${prefix})", { label: "startsWith", type: "method", info: "→ boolean" }),
	snippetCompletion("endsWith(${suffix})", { label: "endsWith", type: "method", info: "→ boolean" }),
	snippetCompletion("contains(${seq})", { label: "contains", type: "method", info: "→ boolean" }),
	snippetCompletion("toString()", { label: "toString", type: "method", info: "→ String" }),
	// Array field
	{ label: "length", type: "property", detail: "array length (field, not method)" },
];

// Java — types / static methods / snippets shown on normal word completion
const JAVA_GENERAL_OPTIONS = [
	// Collection types
	{ label: "ArrayList",    type: "class", info: "java.util.ArrayList<E>" },
	{ label: "HashMap",      type: "class", info: "java.util.HashMap<K,V>" },
	{ label: "HashSet",      type: "class", info: "java.util.HashSet<E>" },
	{ label: "LinkedList",   type: "class", info: "java.util.LinkedList<E>" },
	{ label: "TreeMap",      type: "class", info: "java.util.TreeMap<K,V> sorted" },
	{ label: "TreeSet",      type: "class", info: "java.util.TreeSet<E> sorted" },
	{ label: "PriorityQueue",type: "class", info: "min-heap by default" },
	{ label: "ArrayDeque",   type: "class" },
	{ label: "LinkedHashMap",type: "class", info: "insertion-ordered map" },
	{ label: "Deque",        type: "class" },
	// Static utilities
	{ label: "Arrays.sort",          type: "function" },
	{ label: "Arrays.fill",          type: "function" },
	{ label: "Arrays.copyOf",        type: "function" },
	{ label: "Arrays.copyOfRange",   type: "function" },
	{ label: "Arrays.stream",        type: "function" },
	{ label: "Collections.sort",     type: "function" },
	{ label: "Collections.reverse",  type: "function" },
	{ label: "Collections.max",      type: "function" },
	{ label: "Collections.min",      type: "function" },
	{ label: "Collections.frequency",type: "function" },
	{ label: "Math.max",   type: "function" },
	{ label: "Math.min",   type: "function" },
	{ label: "Math.abs",   type: "function" },
	{ label: "Math.pow",   type: "function" },
	{ label: "Math.sqrt",  type: "function" },
	{ label: "Math.log",   type: "function" },
	{ label: "Math.ceil",  type: "function" },
	{ label: "Math.floor", type: "function" },
	// Constants
	{ label: "Integer.MAX_VALUE", type: "constant", info: "2 147 483 647" },
	{ label: "Integer.MIN_VALUE", type: "constant", info: "-2 147 483 648" },
	{ label: "Long.MAX_VALUE",    type: "constant" },
	{ label: "Long.MIN_VALUE",    type: "constant" },
	// Type conversions
	{ label: "Integer.parseInt",       type: "function" },
	{ label: "Integer.toString",       type: "function" },
	{ label: "Integer.toBinaryString", type: "function" },
	{ label: "Integer.bitCount",       type: "function", info: "count set bits" },
	{ label: "String.valueOf",         type: "function" },
	{ label: "Character.isDigit",      type: "function" },
	{ label: "Character.isLetter",     type: "function" },
	{ label: "Character.isLetterOrDigit", type: "function" },
	{ label: "Character.toLowerCase",  type: "function" },
	{ label: "Character.toUpperCase",  type: "function" },
	// Snippets — boost: 2 floats them to the top
	snippetCompletion("for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}", {
		label: "for-i", type: "keyword", detail: "index for loop", boost: 2,
	}),
	snippetCompletion("for (${Object} ${item} : ${collection}) {\n\t${}\n}", {
		label: "for-each", type: "keyword", detail: "enhanced for loop", boost: 2,
	}),
	snippetCompletion("if (${condition}) {\n\t${}\n}", {
		label: "if", type: "keyword", detail: "if statement", boost: 2,
	}),
	snippetCompletion("while (${condition}) {\n\t${}\n}", {
		label: "while", type: "keyword", detail: "while loop", boost: 2,
	}),
	snippetCompletion("new HashMap<>();", { label: "new-hashmap", type: "class", boost: 1 }),
	snippetCompletion("new ArrayList<>();", { label: "new-arraylist", type: "class", boost: 1 }),
	snippetCompletion("new PriorityQueue<>((a, b) -> ${a} - ${b});", {
		label: "new-pq-lambda", type: "class", detail: "PriorityQueue with comparator", boost: 1,
	}),
	snippetCompletion("new int[${n}]", { label: "new-int-array", type: "class", detail: "int array", boost: 1 }),
	snippetCompletion("new int[${m}][${n}]", { label: "new-2d-array", type: "class", detail: "2-D int array", boost: 1 }),
	snippetCompletion("map.getOrDefault(${key}, ${0}) + ${1}", {
		label: "map-count", type: "function", detail: "increment map counter", boost: 1,
	}),
	snippetCompletion("StringBuilder ${sb} = new StringBuilder();\n${sb}.append(${str});\n${sb}.toString();", {
		label: "stringbuilder", type: "class", detail: "StringBuilder pattern", boost: 1,
	}),
	snippetCompletion("int ${l} = 0, ${r} = ${n} - 1;\nwhile (${l} <= ${r}) {\n\tint ${mid} = ${l} + (${r} - ${l}) / 2;\n\t${}\n}", {
		label: "binary-search", type: "keyword", detail: "binary search template", boost: 1,
	}),
];

// ── Completion source functions ───────────────────────────────────────────────

function cppCompletionSource(context: CompletionContext): CompletionResult | null {
	// Suppress inside comments and string literals
	if (/Comment|String/.test(syntaxTree(context.state).resolveInner(context.pos, -1).name)) return null;

	const word = context.matchBefore(/\w*/);
	const from = word?.from ?? context.pos;

	// Detect member access: chars immediately before current word are `.` or `->`
	const before2 = context.state.sliceDoc(Math.max(0, from - 2), from);
	const prevChar = context.state.sliceDoc(Math.max(0, context.pos - 1), context.pos);
	const isMember = before2.endsWith(".") || before2.endsWith("->") || prevChar === "." || prevChar === ">";

	if (isMember) {
		// Member access: show methods; validFor keeps dropdown open while typing the method name
		return { from, options: CPP_MEMBER_OPTIONS, validFor: /^\w*$/ };
	}

	if (!word || (word.from === word.to && !context.explicit)) return null;
	return { from: word.from, options: CPP_GENERAL_OPTIONS };
}

function javaCompletionSource(context: CompletionContext): CompletionResult | null {
	// Suppress inside comments and string literals
	if (/Comment|String/.test(syntaxTree(context.state).resolveInner(context.pos, -1).name)) return null;

	const word = context.matchBefore(/\w*/);
	const from = word?.from ?? context.pos;

	// Detect member access: char immediately before current word is `.`
	const beforeWord = context.state.sliceDoc(Math.max(0, from - 1), from);
	const prevChar  = context.state.sliceDoc(Math.max(0, context.pos - 1), context.pos);
	const isMember  = beforeWord === "." || prevChar === ".";

	if (isMember) {
		return { from, options: JAVA_MEMBER_OPTIONS, validFor: /^\w*$/ };
	}

	if (!word || (word.from === word.to && !context.explicit)) return null;
	return { from: word.from, options: JAVA_GENERAL_OPTIONS };
}

// ── C++ indentation fix ───────────────────────────────────────────────────────
// @lezer/cpp's built-in indent service does not reliably handle all cases:
//   • `public:` / `private:` / `protected:` are treated as C-style labels → indent 0
//   • Block opener `{` at end of line sometimes yields 0 instead of indent+4
// This service runs with higher priority (registered after the language ext)
// and overrides both cases with a straightforward regex approach.
const cppIndentFix = indentService.of((context, pos) => {
	if (pos === 0) return null;
	const prevText = context.lineAt(pos - 1).text;

	// Access specifiers: indent 4 past the specifier column
	const accessM = prevText.match(/^(\s*)(public|private|protected)\s*:\s*$/);
	if (accessM) return accessM[1].length + 4;

	// Block opener — line whose last non-whitespace char is `{`
	const braceM = prevText.match(/^(\s*).*\{\s*$/);
	if (braceM) return braceM[1].length + 4;

	return null; // let the language extension handle everything else
});

// ── Visual theme (cursor animation + smooth scroll) ──────────────────────────
const editorVisualTheme = EditorView.theme({
	// "expand" cursor: subtle height-pulse instead of opacity blink
	".cm-cursor": {
		borderLeftWidth: "2px",
		animation: "cm-cursor-breathe 1.2s ease-in-out infinite",
	},
	"@keyframes cm-cursor-breathe": {
		"0%, 100%": { transform: "scaleY(1)", opacity: "1" },
		"50%": { transform: "scaleY(0.85)", opacity: "0.85" },
	},
	// Smooth editor scroll
	".cm-scroller": { scrollBehavior: "smooth" },
	// Active-line highlight covers both gutter and content (renderLineHighlight:'all')
	".cm-activeLine": { backgroundColor: "rgba(0,0,0,0.04)" },
	".cm-activeLineGutter": { backgroundColor: "rgba(0,0,0,0.04)" },
});

// ── Base extensions (applied to every language) ───────────────────────────────
// Note: closeBrackets(), closeBracketsKeymap, completionKeymap are already
// provided by @uiw/react-codemirror basicSetup — do NOT add them again or
// the Enter key handler fires twice and the cursor jumps to wrong positions.
const baseExtensions: Extension[] = [
	autocompletion({ activateOnTyping: true }),
	editorVisualTheme,
];

function getEditorExtensions(lang: string): Extension[] {
	switch (lang) {
		case "JavaScript":
			return [...baseExtensions, javascript()];
		case "TypeScript":
			return [...baseExtensions, javascript({ typescript: true })];
		case "Python3":
		case "Python":
			return [
				...baseExtensions,
				python(),
				// globalCompletion: Python builtins (len, range, print, …)
				// localCompletionSource: identifiers already in the file
				pythonLanguage.data.of({ autocomplete: globalCompletion }),
				pythonLanguage.data.of({ autocomplete: localCompletionSource }),
			];
		case "C++":
		case "C":
			return [
				...baseExtensions,
				cpp(),
				indentUnit.of("    "), // 4-space indent to match C++ convention
				cppLanguage.data.of({ autocomplete: cppCompletionSource }),
				cppIndentFix,
			];
		case "Java":
			return [
				...baseExtensions,
				java(),
				javaLanguage.data.of({ autocomplete: javaCompletionSource }),
			];
		case "Rust":
			return [...baseExtensions, rust()];
		case "Go":
			return [...baseExtensions, go()];
		default:
			return [...baseExtensions];
	}
}

const Playground: React.FC<PlaygroundProps> = ({ problem, setSuccess, setSolved }) => {
	const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
	const [activePanel, setActivePanel] = useState<"testcases" | "result" | "submissions">("testcases");
	const [runResult, setRunResult] = useState<RunResultState>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [judgeResult, setJudgeResult] = useState<JudgeResultState>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
	const [loadingSubmissions, setLoadingSubmissions] = useState(false);

	// Derive available languages from templateCodeMap or fall back to JS-only for local problems
	const availableLanguages = useMemo(() => {
		if (problem.templateCodeMap && Object.keys(problem.templateCodeMap).length > 0) {
			return Object.keys(problem.templateCodeMap)
				.map((k) => LANG_DISPLAY[k] || k)
				.filter(Boolean);
		}
		return ["JavaScript"];
	}, [problem.templateCodeMap]);

	// Default to first available language, prefer JavaScript
	const defaultLang = availableLanguages.includes("JavaScript") ? "JavaScript" : availableLanguages[0] || "JavaScript";
	const [selectedLang, setSelectedLang] = useState<string>(defaultLang);

	const getCodeForLang = (lang: string): string => {
		if (problem.templateCodeMap) {
			// 后端 template_code 的 key 就是 display name（"Python3", "C++" 等）
			if (problem.templateCodeMap[lang]) {
				return problem.templateCodeMap[lang];
			}
			// 兼容小写 key 的场景
			const lcKey = LANG_TO_KEY[lang] || lang.toLowerCase();
			if (problem.templateCodeMap[lcKey]) {
				return problem.templateCodeMap[lcKey];
			}
		}
		// 本地题目 fallback
		if (lang === "JavaScript" || lang === "TypeScript") {
			return problem.starterCode;
		}
		return `// ${lang} — no template available for this problem\n`;
	};

	// Returns true if `code` is a stale fallback placeholder (not real user code)
	const isFallbackCode = (code: string, lang: string): boolean =>
		code.trim() === `// ${lang} — no template available for this problem`.trim();

	const loadCodeForLang = (lang: string): string => {
		const saved = localStorage.getItem(`code-${pid}-${lang}`);
		if (saved) {
			const parsed = JSON.parse(saved);
			if (!isFallbackCode(parsed, lang)) return parsed;
		}
		return getCodeForLang(lang);
	};

	const [userCode, setUserCode] = useState<string>(getCodeForLang(defaultLang));

	const [fontSize, setFontSize] = useLocalStorage("lcc-fontSize", "16px");
	const [settings, setSettings] = useState<ISettings>({
		fontSize: fontSize,
		settingsModalIsOpen: false,
		dropdownIsOpen: false,
	});

	const [user] = useAuthState(auth);
	const {
		query: { pid },
	} = useRouter();

	// EditorView ref — used to call requestMeasure() on Split drag (automaticLayout)
	const editorViewRef = useRef<EditorView | null>(null);

	// Stable refs to the latest run/submit handlers so the keymap closure never goes stale
	const handleRunRef = useRef<() => void>(() => {});
	const handleSubmitRef = useRef<() => void>(() => {});

	// Keybindings: Mod-Enter → Run,  Mod-' → Submit
	// Created once; inner refs always point to the current handler version.
	const editorKeybindings = useMemo(
		() =>
			keymap.of([
				{ key: "Mod-Enter", run: () => { handleRunRef.current(); return true; } },
				{ key: "Mod-'",     run: () => { handleSubmitRef.current(); return true; } },
			]),
		[]
	);

	const extensions = useMemo(
		() => [...getEditorExtensions(selectedLang), editorKeybindings],
		[selectedLang, editorKeybindings]
	);

	// Load saved or template code on mount / when pid or user changes
	useEffect(() => {
		if (user) {
			setUserCode(loadCodeForLang(selectedLang));
		} else {
			setUserCode(getCodeForLang(selectedLang));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pid, user]);

	const handleLanguageChange = (lang: string) => {
		// Persist current code for the old language
		localStorage.setItem(`code-${pid}-${selectedLang}`, JSON.stringify(userCode));
		setSelectedLang(lang);
		setUserCode(loadCodeForLang(lang));
	};

	const onChange = (value: string) => {
		setUserCode(value);
		localStorage.setItem(`code-${pid}-${selectedLang}`, JSON.stringify(value));
	};

	// Fetch submission history for this problem
	const fetchSubmissions = async () => {
		if (!user) return;
		const slug = pid as string;
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
		setLoadingSubmissions(true);
		try {
			const res = await fetch(`${backendUrl}/api/v1/problems/${slug}/submissions?limit=20`, {
				headers: { Authorization: `Bearer ${await user.getIdToken()}` },
			});
			if (res.ok) {
				const data = await res.json();
				setSubmissions(data.submissions ?? []);
			}
		} catch {
			// Silently fail — submissions list is optional
		} finally {
			setLoadingSubmissions(false);
		}
	};

	// Run via sandbox API (first test case only, quick debug)
	const handleRun = async () => {
		const slug = pid as string;
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

		setActivePanel("result");
		setIsRunning(true);
		setRunResult(null);
		setJudgeResult(null);

		try {
			const res = await fetch(`${backendUrl}/api/v1/problems/${slug}/run`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ language: selectedLang, code: userCode }),
			});

			if (!res.ok) {
				const err = await res.json();
				setRunResult({ status: "Error", stdout: "", stderr: err.error || "Unknown error", runtime_ms: 0 });
			} else {
				setRunResult(await res.json());
			}
		} catch (error: any) {
			setRunResult({ status: "Error", stdout: "", stderr: error.message, runtime_ms: 0 });
		} finally {
			setIsRunning(false);
		}
	};

	// Submit via judge API (all test cases, output comparison)
	const handleSubmit = async () => {
		if (!user) {
			toast.error("Please login to submit your code", {
				position: "top-center",
				autoClose: 3000,
				theme: "dark",
			});
			return;
		}

		const slug = pid as string;
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

		setActivePanel("result");
		setIsSubmitting(true);
		setRunResult(null);
		setJudgeResult(null);

		try {
			const res = await fetch(`${backendUrl}/api/v1/problems/${slug}/judge`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ language: selectedLang, code: userCode }),
			});

			if (!res.ok) {
				const err = await res.json();
				toast.error(err.error || "Judge failed", { position: "top-center", autoClose: 3000, theme: "dark" });
				return;
			}

			const jr: JudgeResultState = await res.json();
			setJudgeResult(jr);

			if (jr?.status === "Accepted") {
				toast.success("Accepted! All test cases passed 🎉", {
					position: "top-center",
					autoClose: 3000,
					theme: "dark",
				});
				setSuccess(true);
				setTimeout(() => setSuccess(false), 4000);
				setSolved(true);
				// Fire-and-forget: don't block UI on Firebase write
				const userRef = doc(firestore, "users", user.uid);
				updateDoc(userRef, { solvedProblems: arrayUnion(pid) }).catch(() => {});
			}
		} catch (error: any) {
			toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
		} finally {
			setIsSubmitting(false);
		}
	};

	// Keep refs in sync with latest handlers every render (no stale-closure issue)
	handleRunRef.current = handleRun;
	handleSubmitRef.current = handleSubmit;

	return (
		<div className='flex flex-col bg-dark-layer-1 relative overflow-x-hidden'>
			<PreferenceNav
				settings={settings}
				setSettings={setSettings}
				availableLanguages={availableLanguages}
				selectedLanguage={selectedLang}
				onLanguageChange={handleLanguageChange}
			/>

			<Split
				className='h-[calc(100vh-94px)]'
				direction='vertical'
				sizes={[60, 40]}
				minSize={60}
				onDrag={() => editorViewRef.current?.requestMeasure()}
			>
				<div className='w-full overflow-auto'>
					<CodeMirror
						key={selectedLang}
						value={userCode}
						theme="light"
						onChange={onChange}
						extensions={extensions}
						style={{ fontSize: settings.fontSize }}
						onCreateEditor={(view) => { editorViewRef.current = view; }}
					/>
				</div>

				{/* Bottom panel */}
				<div className='w-full px-5 overflow-auto bg-dark-layer-1 border-t border-dark-divider-border-2'>
					{/* Tab bar */}
					<div className='flex h-10 items-center space-x-6'>
						<div
							className='relative flex h-full flex-col justify-center cursor-pointer'
							onClick={() => setActivePanel("testcases")}
						>
							<div
								className={`text-sm font-medium leading-5 ${
									activePanel === "testcases" ? "text-gray-800" : "text-gray-500"
								}`}
							>
								Testcases
							</div>
							{activePanel === "testcases" && (
								<hr className='absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-300' />
							)}
						</div>
						<div
							className='relative flex h-full flex-col justify-center cursor-pointer'
							onClick={() => setActivePanel("result")}
						>
							<div
								className={`text-sm font-medium leading-5 ${
									activePanel === "result" ? "text-gray-800" : "text-gray-500"
								}`}
							>
								Result
							</div>
							{activePanel === "result" && (
								<hr className='absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-300' />
							)}
						</div>
						<div
							className='relative flex h-full flex-col justify-center cursor-pointer'
							onClick={() => {
								setActivePanel("submissions");
								fetchSubmissions();
							}}
						>
							<div
								className={`text-sm font-medium leading-5 ${
									activePanel === "submissions" ? "text-gray-800" : "text-gray-500"
								}`}
							>
								Submissions
							</div>
							{activePanel === "submissions" && (
								<hr className='absolute bottom-0 h-0.5 w-full rounded-full border-none bg-gray-300' />
							)}
						</div>
					</div>

					{/* Testcases tab */}
					{activePanel === "testcases" && (
						<>
							<div className='flex'>
								{problem.examples.map((example, index) => (
									<div
										className='mr-2 items-start mt-2'
										key={example.id}
										onClick={() => setActiveTestCaseId(index)}
									>
										<div className='flex flex-wrap items-center gap-y-4'>
											<div
												className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
												${activeTestCaseId === index ? "text-gray-900" : "text-gray-500"}
											`}
											>
												Case {index + 1}
											</div>
										</div>
									</div>
								))}
							</div>

							<div className='font-semibold my-4'>
								{problem.examples.length > 0 ? (
									<>
										<p className='text-sm font-medium mt-4 text-gray-700'>Input:</p>
										<div className='w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-dark-divider-border-2 text-gray-800 mt-2'>
											{problem.examples[activeTestCaseId]?.inputText}
										</div>
										<p className='text-sm font-medium mt-4 text-gray-700'>Output:</p>
										<div className='w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-dark-divider-border-2 text-gray-800 mt-2'>
											{problem.examples[activeTestCaseId]?.outputText}
										</div>
									</>
								) : (
									<p className='text-sm text-gray-400 mt-4'>
										在线判题功能即将上线，本地测试暂不支持此题目。
									</p>
								)}
							</div>
						</>
					)}

					{/* Result tab */}
					{activePanel === "result" && (
						<div className='my-4 px-1'>
							<JudgeResultPanel
								isRunning={isRunning}
								isSubmitting={isSubmitting}
								runResult={runResult}
								judgeResult={judgeResult}
							/>
						</div>
					)}

					{/* Submissions tab */}
					{activePanel === "submissions" && (
						<div className='my-2 px-1'>
							<SubmissionHistory submissions={submissions} loading={loadingSubmissions} />
						</div>
					)}
				</div>
			</Split>

			<EditorFooter handleRun={handleRun} handleSubmit={handleSubmit} />
		</div>
	);
};
export default Playground;
