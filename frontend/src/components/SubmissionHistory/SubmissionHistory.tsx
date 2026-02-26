import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { go } from "@codemirror/lang-go";
import { javascript } from "@codemirror/lang-javascript";
import { rust } from "@codemirror/lang-rust";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { IoClose } from "react-icons/io5";
import { BsCheckCircle, BsXCircle, BsClock } from "react-icons/bs";

export type SubmissionRecord = {
	id: string;
	status: string;
	language: string;
	runtime_ms: number;
	memory_kb?: number;
	code: string;
	error_message?: string;
	created_at: string;
};

type SubmissionHistoryProps = {
	submissions: SubmissionRecord[];
	loading?: boolean;
};

const langExtMap: Record<string, () => Extension> = {
	cpp: () => cpp(),
	"c++": () => cpp(),
	java: () => java(),
	python3: () => python(),
	python: () => python(),
	go: () => go(),
	javascript: () => javascript(),
	typescript: () => javascript({ typescript: true }),
	rust: () => rust(),
};

const statusIcon: Record<string, React.ReactNode> = {
	Accepted: <BsCheckCircle className="text-green-500" />,
	"Wrong Answer": <BsXCircle className="text-red-500" />,
	WrongAnswer: <BsXCircle className="text-red-500" />,
	"Time Limit Exceeded": <BsClock className="text-yellow-500" />,
	TimeLimitExceeded: <BsClock className="text-yellow-500" />,
	TLE: <BsClock className="text-yellow-500" />,
	"Compile Error": <BsXCircle className="text-red-600" />,
	CompileError: <BsXCircle className="text-red-600" />,
	"Runtime Error": <BsXCircle className="text-orange-500" />,
	RuntimeError: <BsXCircle className="text-orange-500" />,
};

const statusColor: Record<string, string> = {
	Accepted: "text-green-600",
	"Wrong Answer": "text-red-500",
	WrongAnswer: "text-red-500",
	"Time Limit Exceeded": "text-yellow-600",
	TimeLimitExceeded: "text-yellow-600",
	TLE: "text-yellow-600",
	"Compile Error": "text-red-600",
	CompileError: "text-red-600",
	"Runtime Error": "text-orange-600",
	RuntimeError: "text-orange-600",
};

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions, loading }) => {
	const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8 text-gray-400 text-sm">
				加载中...
			</div>
		);
	}

	if (submissions.length === 0) {
		return (
			<div className="flex items-center justify-center py-8 text-gray-400 text-sm">
				暂无提交记录
			</div>
		);
	}

	const selected = selectedIdx !== null ? submissions[selectedIdx] : null;

	return (
		<>
			{/* Submission list */}
			<div className="space-y-1 mt-2 max-h-[40vh] overflow-auto">
				{submissions.map((sub, idx) => (
					<button
						key={sub.id}
						onClick={() => setSelectedIdx(idx)}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-dark-fill-3 ${
							selectedIdx === idx ? "bg-dark-fill-3" : ""
						}`}
					>
						<span>{statusIcon[sub.status] ?? <BsXCircle className="text-gray-400" />}</span>
						<span className={`text-sm font-medium flex-1 ${statusColor[sub.status] ?? "text-gray-600"}`}>
							{sub.status}
						</span>
						<span className="text-xs text-gray-400">{sub.language}</span>
						{sub.runtime_ms > 0 && (
							<span className="text-xs text-gray-400">{sub.runtime_ms} ms</span>
						)}
						<span className="text-xs text-gray-400">
							{new Date(sub.created_at).toLocaleString("zh-CN", {
								month: "2-digit",
								day: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</button>
				))}
			</div>

			{/* Detail modal */}
			{selected && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setSelectedIdx(null)}
					/>
					<div className="relative bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden animate-slide-up">
						{/* Header */}
						<div className="flex items-center justify-between px-5 py-3 border-b border-dark-divider-border-2">
							<div className="flex items-center gap-2">
								{statusIcon[selected.status]}
								<span className={`font-semibold ${statusColor[selected.status] ?? "text-gray-700"}`}>
									{selected.status}
								</span>
								<span className="text-xs text-gray-400 ml-2">{selected.language}</span>
								{selected.runtime_ms > 0 && (
									<span className="text-xs text-gray-400">{selected.runtime_ms} ms</span>
								)}
							</div>
							<button
								onClick={() => setSelectedIdx(null)}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
								<IoClose size={20} />
							</button>
						</div>

						{/* Code */}
						<div className="overflow-auto max-h-[55vh]">
							<CodeMirror
								value={selected.code}
								extensions={[
									...(langExtMap[selected.language.toLowerCase()]
										? [langExtMap[selected.language.toLowerCase()]()]
										: []),
									EditorView.editable.of(false),
									EditorView.lineWrapping,
								]}
								readOnly={true}
								theme="light"
								basicSetup={{
									lineNumbers: true,
									foldGutter: false,
									highlightActiveLine: false,
								}}
								className="text-sm"
							/>
						</div>

						{/* Error message */}
						{selected.error_message && (
							<div className="px-5 py-3 border-t border-dark-divider-border-2">
								<p className="text-xs text-gray-500 mb-1">Error:</p>
								<pre className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 max-h-24 overflow-auto whitespace-pre-wrap">
									{selected.error_message}
								</pre>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default SubmissionHistory;
