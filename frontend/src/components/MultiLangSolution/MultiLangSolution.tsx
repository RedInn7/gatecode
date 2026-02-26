import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { go } from "@codemirror/lang-go";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { SolutionEntry } from "@/utils/types/problem";

type MultiLangSolutionProps = {
	problemSlug: string;
	solutions?: SolutionEntry[];
};

const langExtensionMap: Record<string, () => Extension> = {
	cpp: () => cpp(),
	java: () => java(),
	python3: () => python(),
	python: () => python(),
	go: () => go(),
};

const MultiLangSolution: React.FC<MultiLangSolutionProps> = ({ problemSlug, solutions }) => {
	const data = solutions ?? [];
	const [activeIdx, setActiveIdx] = useState(0);

	if (data.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-gray-400 text-sm">
				Solutions coming soon
			</div>
		);
	}

	const active = data[activeIdx];
	const ext = langExtensionMap[active.langKey];

	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(active.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {}
	};

	return (
		<div>
			{/* Language tabs */}
			<div className="flex border-b border-dark-divider-border-2">
				{data.map((sol, idx) => (
					<button
						key={sol.langKey}
						onClick={() => setActiveIdx(idx)}
						className={`px-4 py-2 text-sm font-medium transition-colors ${
							idx === activeIdx
								? "border-b-2 border-brand-orange text-brand-orange"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						{sol.language}
					</button>
				))}
			</div>

			{/* Code viewer */}
			<div className="relative mt-2">
				<button
					onClick={handleCopy}
					className="absolute top-2 right-2 z-10 bg-dark-fill-3 hover:bg-dark-fill-2 text-gray-600 px-2 py-1 rounded text-xs transition-colors"
				>
					{copied ? "Copied" : "Copy"}
				</button>
				<CodeMirror
					value={active.code}
					extensions={[
						...(ext ? [ext()] : []),
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
					className="text-sm border border-dark-divider-border-2 rounded-lg overflow-hidden"
				/>
			</div>

			{/* Complexity info */}
			{(active.timeComplexity || active.spaceComplexity) && (
				<div className="flex gap-6 mt-3 text-xs text-gray-500">
					{active.timeComplexity && (
						<span>
							<span className="font-medium text-gray-700">时间复杂度:</span> {active.timeComplexity}
						</span>
					)}
					{active.spaceComplexity && (
						<span>
							<span className="font-medium text-gray-700">空间复杂度:</span> {active.spaceComplexity}
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default MultiLangSolution;
