import "katex/dist/katex.min.css";
import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
import useHasMounted from "@/hooks/useHasMounted";
import { problems as localProblems } from "@/utils/problems";
import { BackendProblemDetail, Problem } from "@/utils/types/problem";
import { GetStaticPaths, GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ProblemPage: React.FC = () => {
	const hasMounted = useHasMounted();
	const router = useRouter();
	const pid = router.query.pid as string | undefined;
	const [problem, setProblem] = useState<Problem | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!pid) return;

		const localProblem = localProblems[pid];
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

		// Fetch from backend (with timeout)
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 5000);

		fetch(`${backendUrl}/api/v1/problems/${pid}`, { signal: controller.signal })
			.then((res) => (res.ok ? res.json() : null))
			.catch(() => null)
			.then((backendProblem: BackendProblemDetail | null) => {
				clearTimeout(timer);
				const templateCodeMap: Record<string, string> = backendProblem?.template_code ?? {};

				if (localProblem) {
					setProblem({
						...localProblem,
						handlerFunction: localProblem.handlerFunction.toString(),
						templateCodeMap,
						solutions: backendProblem?.solutions ?? undefined,
						editorial: backendProblem?.editorial ?? undefined,
					});
				} else if (backendProblem) {
					const starterCode =
						templateCodeMap["javascript"] ??
						templateCodeMap["python3"] ??
						templateCodeMap[Object.keys(templateCodeMap)[0]] ??
						"// 暂无模板代码";

					setProblem({
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
						solutions: backendProblem.solutions ?? undefined,
						editorial: backendProblem.editorial ?? undefined,
					});
				} else {
					router.replace("/404");
					return;
				}
				setLoading(false);
			});

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [pid]);

	if (!hasMounted || !pid) return null;

	if (loading || !problem) {
		return (
			<div>
				<Topbar problemPage />
				<div className='flex items-center justify-center h-[calc(100vh-50px)]'>
					<div className='animate-pulse text-gray-400 text-sm'>Loading problem...</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<Topbar problemPage problem={problem} />
			<Workspace problem={problem} />
		</div>
	);
};
export default ProblemPage;

// Static shell with fallback — no server round-trip after first visit.
// Data is fetched client-side in the useEffect above.
export const getStaticPaths: GetStaticPaths = async () => ({
	paths: [],
	fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async () => ({
	props: {},
});
