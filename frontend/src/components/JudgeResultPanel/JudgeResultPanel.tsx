import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCheckCircle, BsXCircle, BsClock, BsCpu, BsExclamationTriangle, BsArrowRepeat } from "react-icons/bs";

type RunResult = {
	status: string;
	stdout: string;
	stderr: string;
	runtime_ms: number;
};

type FailedCase = {
	index: number;
	input?: string;
	expected?: string;
	actual?: string;
};

type JudgeResult = {
	status: string;
	passed: number;
	total: number;
	runtime_ms: number;
	memory_kb?: number;
	failed_case?: FailedCase;
};

type JudgeResultPanelProps = {
	isRunning: boolean;
	isSubmitting: boolean;
	runResult: RunResult | null;
	judgeResult: JudgeResult | null;
};

// Mock percentile data — in production this comes from the backend
function mockPercentile(runtime_ms: number): { runtimePct: number; memoryPct: number } {
	// Simulate: lower runtime → higher percentile
	const runtimePct = Math.min(99, Math.max(5, 100 - runtime_ms * 0.8 + Math.random() * 20));
	const memoryPct = Math.min(95, Math.max(10, 60 + Math.random() * 30));
	return { runtimePct: Math.round(runtimePct), memoryPct: Math.round(memoryPct) };
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
	Accepted: {
		icon: <BsCheckCircle className="text-lg" />,
		color: "text-green-600",
		bg: "bg-green-50",
		label: "Accepted",
	},
	WrongAnswer: {
		icon: <BsXCircle className="text-lg" />,
		color: "text-red-500",
		bg: "bg-red-50",
		label: "Wrong Answer",
	},
	"Wrong Answer": {
		icon: <BsXCircle className="text-lg" />,
		color: "text-red-500",
		bg: "bg-red-50",
		label: "Wrong Answer",
	},
	TimeLimitExceeded: {
		icon: <BsClock className="text-lg" />,
		color: "text-yellow-600",
		bg: "bg-yellow-50",
		label: "Time Limit Exceeded",
	},
	TLE: {
		icon: <BsClock className="text-lg" />,
		color: "text-yellow-600",
		bg: "bg-yellow-50",
		label: "Time Limit Exceeded",
	},
	CompileError: {
		icon: <BsXCircle className="text-lg" />,
		color: "text-red-600",
		bg: "bg-red-50",
		label: "Compile Error",
	},
	RuntimeError: {
		icon: <BsXCircle className="text-lg" />,
		color: "text-orange-600",
		bg: "bg-orange-50",
		label: "Runtime Error",
	},
	MemoryLimitExceeded: {
		icon: <BsExclamationTriangle className="text-lg" />,
		color: "text-purple-600",
		bg: "bg-purple-50",
		label: "Memory Limit Exceeded",
	},
	MLE: {
		icon: <BsExclamationTriangle className="text-lg" />,
		color: "text-purple-600",
		bg: "bg-purple-50",
		label: "Memory Limit Exceeded",
	},
	SystemError: {
		icon: <BsArrowRepeat className="text-lg" />,
		color: "text-gray-600",
		bg: "bg-gray-100",
		label: "System Error",
	},
};

const defaultStatus = {
	icon: <BsXCircle className="text-lg" />,
	color: "text-gray-600",
	bg: "bg-gray-50",
	label: "Error",
};

/** Animated judging state */
const JudgingAnimation: React.FC<{ isSubmitting: boolean }> = ({ isSubmitting }) => {
	const [dots, setDots] = useState("");

	useEffect(() => {
		if (!isSubmitting) return;
		const interval = setInterval(() => {
			setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
		}, 400);
		return () => clearInterval(interval);
	}, [isSubmitting]);

	return (
		<div className="flex flex-col items-center justify-center py-8 animate-fade-in">
			<div className="relative mb-4">
				<AiOutlineLoading3Quarters className="animate-spin text-3xl text-brand-orange" />
				<div className="absolute inset-0 animate-ping opacity-20">
					<AiOutlineLoading3Quarters className="text-3xl text-brand-orange" />
				</div>
			</div>
			<p className="text-sm font-medium text-gray-700">
				{isSubmitting ? "Judging" : "Running"}{dots}
			</p>
			<p className="text-xs text-gray-400 mt-1">
				{isSubmitting ? "正在运行所有测试用例" : "正在编译并运行"}
			</p>
		</div>
	);
};

/** Percentile bar for runtime/memory */
const PercentileBar: React.FC<{ label: string; value: string; percentile: number; icon: React.ReactNode }> = ({
	label,
	value,
	percentile,
	icon,
}) => {
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const timer = setTimeout(() => setWidth(percentile), 100);
		return () => clearTimeout(timer);
	}, [percentile]);

	return (
		<div className="flex items-center gap-3">
			<div className="text-gray-400">{icon}</div>
			<div className="flex-1">
				<div className="flex justify-between text-xs mb-1">
					<span className="text-gray-600">{label}: {value}</span>
					<span className="text-gray-500">击败 {percentile}% 的提交</span>
				</div>
				<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
					<div
						className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-brand-orange to-dark-green-s"
						style={{ width: `${width}%` }}
					/>
				</div>
			</div>
		</div>
	);
};

/** Side-by-side diff for WA */
const DiffView: React.FC<{ expected: string; actual: string }> = ({ expected, actual }) => {
	const expLines = expected.split("\n");
	const actLines = actual.split("\n");
	const maxLen = Math.max(expLines.length, actLines.length);

	return (
		<div className="grid grid-cols-2 gap-2 text-xs font-mono">
			<div>
				<p className="text-green-600 font-medium mb-1 font-sans text-xs">Expected Output</p>
				<div className="rounded-lg border border-green-200 bg-green-50 overflow-auto max-h-40">
					{Array.from({ length: maxLen }).map((_, i) => {
						const line = expLines[i] ?? "";
						const differs = line !== (actLines[i] ?? "");
						return (
							<div
								key={i}
								className={`px-3 py-0.5 ${differs ? "bg-green-100" : ""}`}
							>
								{line || "\u00A0"}
							</div>
						);
					})}
				</div>
			</div>
			<div>
				<p className="text-red-500 font-medium mb-1 font-sans text-xs">Your Output</p>
				<div className="rounded-lg border border-red-200 bg-red-50 overflow-auto max-h-40">
					{Array.from({ length: maxLen }).map((_, i) => {
						const line = actLines[i] ?? "";
						const differs = line !== (expLines[i] ?? "");
						return (
							<div
								key={i}
								className={`px-3 py-0.5 ${differs ? "bg-red-100" : ""}`}
							>
								{line || "\u00A0"}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

const JudgeResultPanel: React.FC<JudgeResultPanelProps> = ({
	isRunning,
	isSubmitting,
	runResult,
	judgeResult,
}) => {
	// Loading state
	if (isRunning || isSubmitting) {
		return <JudgingAnimation isSubmitting={isSubmitting} />;
	}

	// /run result
	if (runResult) {
		const cfg = statusConfig[runResult.status] ?? defaultStatus;
		return (
			<div className="animate-slide-up">
				<div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cfg.bg} mb-3`}>
					<span className={cfg.color}>{cfg.icon}</span>
					<span className={`font-medium text-sm ${cfg.color}`}>{cfg.label}</span>
					{runResult.runtime_ms > 0 && (
						<span className="text-xs text-gray-400 ml-auto">{runResult.runtime_ms} ms</span>
					)}
				</div>
				{runResult.stdout && (
					<div className="mb-2">
						<p className="text-xs text-gray-500 mb-1">Output:</p>
						<pre className="w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-32">
							{runResult.stdout}
						</pre>
					</div>
				)}
				{runResult.stderr && (
					<div>
						<p className="text-xs text-gray-500 mb-1">Stderr:</p>
						<pre className="w-full rounded-lg border px-3 py-2 bg-red-50 border-red-200 text-sm text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
							{runResult.stderr}
						</pre>
					</div>
				)}
			</div>
		);
	}

	// /judge result
	if (judgeResult) {
		const cfg = statusConfig[judgeResult.status] ?? defaultStatus;
		const isAC = judgeResult.status === "Accepted";
		const pct = isAC ? mockPercentile(judgeResult.runtime_ms) : null;
		const isWA = judgeResult.status === "WrongAnswer" || judgeResult.status === "Wrong Answer";
		const isCompileErr = judgeResult.status === "CompileError" && judgeResult.failed_case?.index === -1;

		return (
			<div className="animate-slide-up space-y-3">
				{/* Status header */}
				<div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${cfg.bg}`}>
					<span className={cfg.color}>{cfg.icon}</span>
					<div className="flex-1">
						<span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
						<span className="text-xs text-gray-400 ml-3">
							{judgeResult.passed} / {judgeResult.total} passed
						</span>
					</div>
					{judgeResult.runtime_ms > 0 && (
						<span className="text-xs text-gray-500">{judgeResult.runtime_ms} ms</span>
					)}
				</div>

				{/* AC: Percentile bars */}
				{isAC && pct && (
					<div className="space-y-2 px-1">
						<PercentileBar
							label="Runtime"
							value={`${judgeResult.runtime_ms} ms`}
							percentile={pct.runtimePct}
							icon={<BsClock className="text-sm" />}
						/>
						<PercentileBar
							label="Memory"
							value={judgeResult.memory_kb ? `${(judgeResult.memory_kb / 1024).toFixed(1)} MB` : "N/A"}
							percentile={pct.memoryPct}
							icon={<BsCpu className="text-sm" />}
						/>
					</div>
				)}

				{/* WA: Diff view */}
				{isWA && judgeResult.failed_case && judgeResult.failed_case.index >= 0 && (
					<div className="space-y-2 px-1">
						<p className="text-xs text-gray-500">
							Failed on test case #{judgeResult.failed_case.index + 1}
						</p>
						{judgeResult.failed_case.input && (
							<div>
								<p className="text-xs text-gray-500 mb-1">Input:</p>
								<pre className="w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-24">
									{judgeResult.failed_case.input}
								</pre>
							</div>
						)}
						{judgeResult.failed_case.expected && judgeResult.failed_case.actual && (
							<DiffView
								expected={judgeResult.failed_case.expected}
								actual={judgeResult.failed_case.actual}
							/>
						)}
					</div>
				)}

				{/* RE/TLE: show failed case info */}
				{!isAC && !isWA && !isCompileErr && judgeResult.failed_case && judgeResult.failed_case.index >= 0 && (
					<div className="space-y-2 px-1">
						<p className="text-xs text-gray-500">
							Failed on test case #{judgeResult.failed_case.index + 1}
						</p>
						{judgeResult.failed_case.input && (
							<div>
								<p className="text-xs text-gray-500 mb-1">Input:</p>
								<pre className="w-full rounded-lg border px-3 py-2 bg-dark-fill-3 border-dark-divider-border-2 text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-24">
									{judgeResult.failed_case.input}
								</pre>
							</div>
						)}
						{judgeResult.failed_case.actual && (
							<div>
								<p className="text-xs text-gray-500 mb-1">Error:</p>
								<pre className="w-full rounded-lg border px-3 py-2 bg-red-50 border-red-200 text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
									{judgeResult.failed_case.actual}
								</pre>
							</div>
						)}
					</div>
				)}

				{/* Compile Error */}
				{isCompileErr && judgeResult.failed_case?.actual && (
					<div className="px-1">
						<p className="text-xs text-gray-500 mb-1">Compile Error:</p>
						<pre className="w-full rounded-lg border px-3 py-2 bg-red-50 border-red-200 text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40">
							{judgeResult.failed_case.actual}
						</pre>
					</div>
				)}

				{/* MLE hint */}
				{judgeResult.status === "MemoryLimitExceeded" && (
					<div className="px-1">
						<p className="text-xs text-purple-600">
							Your solution exceeded the memory limit. Try optimizing data structures or reducing allocations.
						</p>
					</div>
				)}

				{/* System Error hint */}
				{judgeResult.status === "SystemError" && (
					<div className="px-1">
						<p className="text-xs text-gray-500">
							A system error occurred during judging. Please try resubmitting. If the issue persists, contact support.
						</p>
					</div>
				)}
			</div>
		);
	}

	// No result yet
	return (
		<div className="flex items-center justify-center py-8 text-gray-400 text-sm">
			Click Run or Submit to execute your code.
		</div>
	);
};

export default JudgeResultPanel;
