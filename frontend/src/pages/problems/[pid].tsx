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
			<Topbar problemPage />
			<Workspace problem={problem} />
		</div>
	);
};
export default ProblemPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const pid = params?.pid as string;

	// 优先使用本地题目（含 handlerFunction，支持本地测试）
	const localProblem = localProblems[pid];
	if (localProblem) {
		return {
			props: {
				problem: {
					...localProblem,
					handlerFunction: localProblem.handlerFunction.toString(),
				},
			},
		};
	}

	// 从后端 API 获取题目详情
	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
	try {
		const res = await fetch(`${backendUrl}/api/v1/problems/${pid}`);
		if (!res.ok) {
			return { notFound: true };
		}
		const bp: BackendProblemDetail = await res.json();

		// 提取模板代码（优先 JavaScript，其次 Python3）
		const templateCode = bp.template_code || {};
		const starterCode =
			templateCode["javascript"] ||
			templateCode["python3"] ||
			templateCode[Object.keys(templateCode)[0]] ||
			"// 暂无模板代码";

		const problem: Problem = {
			id: bp.slug,
			title: bp.title,
			problemStatement: bp.content,
			examples: [],
			constraints: "",
			order: bp.frontend_question_id,
			starterCode,
			handlerFunction: "",
			starterFunctionName: "",
		};

		return { props: { problem } };
	} catch {
		return { notFound: true };
	}
};
