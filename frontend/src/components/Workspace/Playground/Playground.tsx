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

// ── Completion sources ────────────────────────────────────────────────────────

function cppCompletionSource(context: CompletionContext): CompletionResult | null {
	// Suppress inside comments and string literals
	const nodeName = syntaxTree(context.state).resolveInner(context.pos, -1).name;
	if (/Comment|String/.test(nodeName)) return null;

	// Trigger on regular word OR right after `.` / `->`
	const word = context.matchBefore(/\w*/);
	const prevChar = context.state.sliceDoc(Math.max(0, context.pos - 1), context.pos);
	const isMemberTrigger = prevChar === "." || prevChar === ">";
	if (!word || (word.from === word.to && !context.explicit && !isMemberTrigger)) return null;

	return {
		from: word.from,
		options: [
			// Containers
			{ label: "vector", type: "class", info: "std::vector<T>" },
			{ label: "unordered_map", type: "class", info: "std::unordered_map<K,V> — O(1) hash map" },
			{ label: "unordered_set", type: "class", info: "std::unordered_set<T> — O(1) hash set" },
			{ label: "map", type: "class", info: "std::map<K,V> — ordered map O(log n)" },
			{ label: "set", type: "class", info: "std::set<T> — ordered set O(log n)" },
			{ label: "multimap", type: "class" },
			{ label: "multiset", type: "class" },
			{ label: "stack", type: "class", info: "LIFO" },
			{ label: "queue", type: "class", info: "FIFO" },
			{ label: "priority_queue", type: "class", info: "max-heap by default" },
			{ label: "deque", type: "class", info: "double-ended queue" },
			{ label: "list", type: "class", info: "doubly linked list" },
			{ label: "string", type: "class" },
			{ label: "pair", type: "class", info: "std::pair<F,S>" },
			// Algorithms
			{ label: "sort", type: "function", info: "sort(first, last [, comp])" },
			{ label: "stable_sort", type: "function" },
			{ label: "binary_search", type: "function", info: "→ bool" },
			{ label: "lower_bound", type: "function", info: "first element ≥ value" },
			{ label: "upper_bound", type: "function", info: "first element > value" },
			{ label: "max_element", type: "function" },
			{ label: "min_element", type: "function" },
			{ label: "reverse", type: "function" },
			{ label: "accumulate", type: "function", info: "accumulate(first, last, init)" },
			{ label: "find", type: "function" },
			{ label: "count", type: "function" },
			{ label: "unique", type: "function", info: "remove consecutive duplicates" },
			{ label: "fill", type: "function" },
			{ label: "next_permutation", type: "function" },
			{ label: "nth_element", type: "function" },
			// Utilities
			{ label: "make_pair", type: "function" },
			{ label: "swap", type: "function" },
			{ label: "abs", type: "function" },
			{ label: "max", type: "function" },
			{ label: "min", type: "function" },
			{ label: "pow", type: "function" },
			{ label: "sqrt", type: "function" },
			{ label: "to_string", type: "function", info: "→ std::string" },
			{ label: "stoi", type: "function", info: "string → int" },
			{ label: "stoll", type: "function", info: "string → long long" },
			{ label: "stod", type: "function", info: "string → double" },
			// Constants
			{ label: "INT_MAX", type: "constant", info: "2 147 483 647" },
			{ label: "INT_MIN", type: "constant", info: "-2 147 483 648" },
			{ label: "LLONG_MAX", type: "constant" },
			{ label: "LLONG_MIN", type: "constant" },
			// Snippets — boost > 0 so they sort to the top of the list
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
			snippetCompletion("vector<${int}> ${name}(${n}, ${0});", {
				label: "vector-init", type: "class", detail: "vector with default value", boost: 1,
			}),
			snippetCompletion("unordered_map<${int}, ${int}> ${mp};", {
				label: "umap", type: "class", detail: "unordered_map", boost: 1,
			}),
		],
	};
}

function javaCompletionSource(context: CompletionContext): CompletionResult | null {
	// Suppress inside comments and string literals
	const nodeName = syntaxTree(context.state).resolveInner(context.pos, -1).name;
	if (/Comment|String/.test(nodeName)) return null;

	// Trigger on regular word OR right after `.`
	const word = context.matchBefore(/\w*/);
	const prevChar = context.state.sliceDoc(Math.max(0, context.pos - 1), context.pos);
	if (!word || (word.from === word.to && !context.explicit && prevChar !== ".")) return null;

	return {
		from: word.from,
		options: [
			// Collections
			{ label: "ArrayList", type: "class", info: "java.util.ArrayList<E>" },
			{ label: "HashMap", type: "class", info: "java.util.HashMap<K,V>" },
			{ label: "HashSet", type: "class", info: "java.util.HashSet<E>" },
			{ label: "LinkedList", type: "class", info: "java.util.LinkedList<E>" },
			{ label: "TreeMap", type: "class", info: "java.util.TreeMap<K,V> sorted" },
			{ label: "TreeSet", type: "class", info: "java.util.TreeSet<E> sorted" },
			{ label: "PriorityQueue", type: "class", info: "min-heap by default" },
			{ label: "ArrayDeque", type: "class" },
			{ label: "Deque", type: "class" },
			// Static methods
			{ label: "Arrays.sort", type: "function" },
			{ label: "Arrays.fill", type: "function" },
			{ label: "Arrays.copyOf", type: "function" },
			{ label: "Arrays.copyOfRange", type: "function" },
			{ label: "Collections.sort", type: "function" },
			{ label: "Collections.reverse", type: "function" },
			{ label: "Collections.frequency", type: "function" },
			{ label: "Math.max", type: "function" },
			{ label: "Math.min", type: "function" },
			{ label: "Math.abs", type: "function" },
			{ label: "Math.pow", type: "function" },
			{ label: "Math.sqrt", type: "function" },
			// Constants
			{ label: "Integer.MAX_VALUE", type: "constant", info: "2 147 483 647" },
			{ label: "Integer.MIN_VALUE", type: "constant", info: "-2 147 483 648" },
			{ label: "Long.MAX_VALUE", type: "constant" },
			// Conversions
			{ label: "Integer.parseInt", type: "function" },
			{ label: "Integer.toString", type: "function" },
			{ label: "String.valueOf", type: "function" },
			{ label: "Character.isDigit", type: "function" },
			{ label: "Character.isLetter", type: "function" },
			{ label: "Character.toLowerCase", type: "function" },
			{ label: "Character.toUpperCase", type: "function" },
			// Snippets — boosted to sort first
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
		],
	};
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
	const [activePanel, setActivePanel] = useState<"testcases" | "result">("testcases");
	const [runResult, setRunResult] = useState<RunResultState>(null);
	const [isRunning, setIsRunning] = useState(false);
	const [judgeResult, setJudgeResult] = useState<JudgeResultState>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
				const userRef = doc(firestore, "users", user.uid);
				await updateDoc(userRef, { solvedProblems: arrayUnion(pid) });
				setSolved(true);
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

	const statusColor = (status: string) => {
		if (status === "Accepted") return "bg-green-600 text-white";
		if (status === "WrongAnswer") return "bg-red-500 text-white";
		if (status === "TimeLimitExceeded") return "bg-yellow-500 text-white";
		if (status === "TLE") return "bg-yellow-500 text-white";
		if (status === "Error" || status === "RuntimeError" || status === "CompileError")
			return "bg-red-600 text-white";
		return "bg-dark-fill-3 text-dark-label-2";
	};

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
							{/* Loading states */}
							{(isRunning || isSubmitting) && (
								<p className='text-sm text-gray-400'>
									{isSubmitting ? "Judging against all test cases..." : "Running..."}
								</p>
							)}

							{/* /run result */}
							{!isRunning && !isSubmitting && runResult && (
								<>
									<div className='flex items-center gap-3 mb-3'>
										<span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(runResult.status)}`}>
											{runResult.status}
										</span>
										{runResult.runtime_ms > 0 && (
											<span className='text-xs text-gray-400'>{runResult.runtime_ms} ms</span>
										)}
										<span className='text-xs text-gray-500'>Test case 1</span>
									</div>
									{runResult.stdout && (
										<div className='mb-2'>
											<p className='text-xs text-gray-500 mb-1'>Output:</p>
											<pre className='w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-sm text-gray-200 whitespace-pre-wrap overflow-auto'>
												{runResult.stdout}
											</pre>
										</div>
									)}
									{runResult.stderr && (
										<div>
											<p className='text-xs text-gray-500 mb-1'>Stderr:</p>
											<pre className='w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-sm text-red-300 whitespace-pre-wrap overflow-auto'>
												{runResult.stderr}
											</pre>
										</div>
									)}
								</>
							)}

							{/* /judge result */}
							{!isRunning && !isSubmitting && judgeResult && (
								<>
									<div className='flex items-center gap-3 mb-3'>
										<span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(judgeResult.status)}`}>
											{judgeResult.status}
										</span>
										<span className='text-xs text-gray-400'>
											{judgeResult.passed} / {judgeResult.total} cases passed
										</span>
										{judgeResult.runtime_ms > 0 && (
											<span className='text-xs text-gray-400'>{judgeResult.runtime_ms} ms</span>
										)}
									</div>

									{/* Wrong Answer / Runtime Error: show failed case */}
									{judgeResult.failed_case && judgeResult.failed_case.index >= 0 && (
										<div className='space-y-2 text-sm'>
											<p className='text-xs text-gray-500'>
												Failed on test case {judgeResult.failed_case.index + 1}
											</p>
											{judgeResult.failed_case.input && (
												<div>
													<p className='text-xs text-gray-500 mb-1'>Input:</p>
													<pre className='w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-xs text-gray-300 whitespace-pre-wrap overflow-auto'>
														{judgeResult.failed_case.input}
													</pre>
												</div>
											)}
											{judgeResult.failed_case.expected && (
												<div>
													<p className='text-xs text-gray-500 mb-1'>Expected:</p>
													<pre className='w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-xs text-green-300 whitespace-pre-wrap overflow-auto'>
														{judgeResult.failed_case.expected}
													</pre>
												</div>
											)}
											{judgeResult.failed_case.actual && (
												<div>
													<p className='text-xs text-gray-500 mb-1'>
														{judgeResult.status === "RuntimeError" || judgeResult.status === "CompileError"
															? "Error:"
															: "Your output:"}
													</p>
													<pre className='w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-xs text-red-300 whitespace-pre-wrap overflow-auto'>
														{judgeResult.failed_case.actual}
													</pre>
												</div>
											)}
										</div>
									)}

									{/* Compile Error */}
									{judgeResult.failed_case && judgeResult.failed_case.index === -1 && (
										<div>
											<p className='text-xs text-gray-500 mb-1'>Compile Error:</p>
											<pre className='w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-xs text-red-300 whitespace-pre-wrap overflow-auto'>
												{judgeResult.failed_case.actual}
											</pre>
										</div>
									)}
								</>
							)}

							{!isRunning && !isSubmitting && !runResult && !judgeResult && (
								<p className='text-sm text-gray-400'>Click Run or Submit to execute your code.</p>
							)}
						</div>
					)}
				</div>
			</Split>

			<EditorFooter handleRun={handleRun} handleSubmit={handleSubmit} />
		</div>
	);
};
export default Playground;
