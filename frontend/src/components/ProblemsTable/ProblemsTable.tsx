import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import YouTube from "react-youtube";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase/firebase";
import { BackendProblemListItem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";

const PAGE_LIMIT = 100;

type ProblemsTableProps = {
	setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProblemsTable: React.FC<ProblemsTableProps> = ({ setLoadingProblems }) => {
	const [youtubePlayer, setYoutubePlayer] = useState({ isOpen: false, videoId: "" });
	const { problems, hasMore, isFetchingMore, loadMore } = useGetProblems(setLoadingProblems);
	const solvedProblems = useGetSolvedProblems();

	// 哨兵 ref：进入视口时触发加载下一页
	const sentinelRef = useRef<HTMLTableRowElement>(null);
	const loadMoreRef = useRef(loadMore);
	useEffect(() => {
		loadMoreRef.current = loadMore;
	}, [loadMore]);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMoreRef.current();
				}
			},
			{ rootMargin: "300px" }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, []);

	const closeModal = () => setYoutubePlayer({ isOpen: false, videoId: "" });
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	return (
		<>
			<tbody className='text-gray-800'>
				{problems.map((problem, idx) => {
					const difficulyColor =
						problem.difficulty === "Easy"
							? "text-dark-green-s"
							: problem.difficulty === "Medium"
							? "text-dark-yellow"
							: "text-dark-pink";
					return (
						<tr className={`${idx % 2 == 1 ? "bg-dark-layer-1" : ""}`} key={problem.id}>
							<th className='px-2 py-4 font-medium whitespace-nowrap text-dark-green-s'>
								{solvedProblems.includes(problem.slug) && (
									<BsCheckCircle fontSize={"18"} width='18' />
								)}
							</th>
							<td className='px-6 py-4'>
								<Link
									className='hover:text-blue-600 cursor-pointer'
									href={`/problems/${problem.slug}`}
								>
									{problem.frontend_question_id}. {problem.title}
								</Link>
							</td>
							<td className={`px-6 py-4 ${difficulyColor}`}>{problem.difficulty}</td>
							<td className={"px-6 py-4"}>
								{problem.is_vip_only ? (
									<span className='text-dark-yellow text-xs'>会员</span>
								) : (
									<span className='text-gray-400'>免费</span>
								)}
							</td>
							<td className={"px-6 py-4"}>
								<p className='text-gray-400'>Coming soon</p>
							</td>
						</tr>
					);
				})}

				{/* 加载更多指示 */}
				{isFetchingMore && (
					<tr>
						<td colSpan={5} className='text-center py-4 text-gray-500 text-sm'>
							加载中...
						</td>
					</tr>
				)}

				{/* 已加载全部 */}
				{!hasMore && problems.length > 0 && (
					<tr>
						<td colSpan={5} className='text-center py-6 text-gray-600 text-sm'>
							已加载全部 {problems.length} 道题目
						</td>
					</tr>
				)}

				{/* 哨兵行：始终渲染，避免 IntersectionObserver 丢失节点 */}
				<tr ref={sentinelRef}>
					<td colSpan={5} className='h-1' />
				</tr>
			</tbody>

			{youtubePlayer.isOpen && (
				<tfoot className='fixed top-0 left-0 h-screen w-screen flex items-center justify-center'>
					<div
						className='bg-black z-10 opacity-70 top-0 left-0 w-screen h-screen absolute'
						onClick={closeModal}
					></div>
					<div className='w-full z-50 h-full px-6 relative max-w-4xl'>
						<div className='w-full h-full flex items-center justify-center relative'>
							<div className='w-full relative'>
								<IoClose
									fontSize={"35"}
									className='cursor-pointer absolute -top-16 right-0'
									onClick={closeModal}
								/>
								<YouTube
									videoId={youtubePlayer.videoId}
									loading='lazy'
									iframeClassName='w-full min-h-[500px]'
								/>
							</div>
						</div>
					</div>
				</tfoot>
			)}
		</>
	);
};
export default ProblemsTable;

function useGetProblems(setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>) {
	const [problems, setProblems] = useState<BackendProblemListItem[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const isFetching = useRef(false);
	const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";

	const fetchPage = useCallback(
		async (pageNum: number) => {
			if (isFetching.current) return;
			isFetching.current = true;

			const isFirst = pageNum === 1;
			if (isFirst) setLoadingProblems(true);
			else setIsFetchingMore(true);

			try {
				const res = await fetch(
					`${backendUrl}/api/v1/problems?page=${pageNum}&limit=${PAGE_LIMIT}`
				);
				if (!res.ok) throw new Error("获取题目失败");
				const data: { total: number; problems: BackendProblemListItem[] } = await res.json();
				const incoming = data.problems ?? [];
				setProblems((prev) => (isFirst ? incoming : [...prev, ...incoming]));
				setHasMore(pageNum * PAGE_LIMIT < (data.total ?? 0));
			} catch (err) {
				console.error("从后端获取题目失败:", err);
			} finally {
				if (isFirst) setLoadingProblems(false);
				else setIsFetchingMore(false);
				isFetching.current = false;
			}
		},
		[backendUrl, setLoadingProblems]
	);

	// 首次加载
	useEffect(() => {
		fetchPage(1);
	}, [fetchPage]);

	const loadMore = useCallback(() => {
		if (!hasMore || isFetching.current) return;
		const next = page + 1;
		setPage(next);
		fetchPage(next);
	}, [hasMore, page, fetchPage]);

	return { problems, hasMore, isFetchingMore, loadMore };
}

function useGetSolvedProblems() {
	const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
	const [user] = useAuthState(auth);

	useEffect(() => {
		const getSolvedProblems = async () => {
			const userRef = doc(firestore, "users", user!.uid);
			const userDoc = await getDoc(userRef);
			if (userDoc.exists()) {
				setSolvedProblems(userDoc.data().solvedProblems);
			}
		};

		if (user) getSolvedProblems();
		if (!user) setSolvedProblems([]);
	}, [user]);

	return solvedProblems;
}
