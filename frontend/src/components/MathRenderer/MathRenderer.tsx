import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

type MathRendererProps = {
	content: string;
	className?: string;
};

const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
	return (
		<div className={className}>
			<ReactMarkdown
				remarkPlugins={[remarkMath]}
				rehypePlugins={[rehypeKatex, rehypeRaw]}
				components={{
					code({ className: codeClassName, children, ...props }) {
						return (
							<code
								className={`${codeClassName ?? ""} bg-dark-fill-3 px-1 py-0.5 rounded text-sm`}
								{...props}
							>
								{children}
							</code>
						);
					},
					pre({ children, ...props }) {
						return (
							<pre
								className="bg-dark-fill-3 p-3 rounded-lg overflow-x-auto text-sm my-2"
								{...props}
							>
								{children}
							</pre>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MathRenderer;
