import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { problems as localProblems } from "@/utils/problems";
import { BackendProblemDetail, Problem } from "@/utils/types/problem";
import { GetServerSideProps } from "next";
import React from "react";

type ProblemPageProps = {
	problem: Problem;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ problem }) => {
	const hasMounted = useHasMounted();
	if (!hasMounted) return null;

	return (
		<div>
			<Topbar problemPage problem={problem} />
			<Workspace problem={problem} />
		</div>
	);
};
export default ProblemPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const pid = params?.pid as string;
	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

	// 先从后端拉一次，获取所有语言的 template_code（本地题目也需要）
	let backendProblem: BackendProblemDetail | null = null;
	try {
		const res = await fetch(`${backendUrl}/api/v1/problems/${pid}`);
		if (res.ok) {
			backendProblem = await res.json();
		}
	} catch {
		// 后端不可用时降级
	}

	const templateCodeMap: Record<string, string> = backendProblem?.template_code ?? {};

	// 优先使用本地题目（含 handlerFunction，支持本地测试）
	const localProblem = localProblems[pid];
	if (localProblem) {
		return {
			props: {
				problem: {
					...localProblem,
					handlerFunction: localProblem.handlerFunction.toString(),
					templateCodeMap,
				},
			},
		};
	}

	// 纯后端题目
	if (!backendProblem) {
		return { notFound: true };
	}

	const starterCode =
		templateCodeMap["javascript"] ??
		templateCodeMap["python3"] ??
		templateCodeMap[Object.keys(templateCodeMap)[0]] ??
		"// 暂无模板代码";

	const problem: Problem = {
		id: backendProblem.slug,
		title: `${backendProblem.frontend_question_id}. ${backendProblem.title}`,
		problemStatement: backendProblem.content,
		examples: [],
		constraints: "",
		order: backendProblem.frontend_question_id,
		difficulty: backendProblem.difficulty,
		starterCode,
		handlerFunction: "",
		starterFunctionName: "",
		templateCodeMap,
	};

	return { props: { problem } };
};
