import { auth } from "@/firebase/firebase";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Logout from "../Buttons/Logout";
import { useSetRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import Timer from "../Timer/Timer";
import { useRouter } from "next/router";
import { BackendProblemListItem, Problem } from "@/utils/types/problem";

type TopbarProps = {
	problemPage?: boolean;
	problem?: Problem;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage, problem }) => {
	const [user] = useAuthState(auth);
	const setAuthModalState = useSetRecoilState(authModalState);
	const router = useRouter();

	// 拉取当前题目周围的题目列表，用于左右导航（限制数量，避免阻塞）
	const [allProblems, setAllProblems] = useState<BackendProblemListItem[]>([]);
	useEffect(() => {
		if (!problemPage) return;
		const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8081";
		const controller = new AbortController();
		fetch(`${backendUrl}/api/v1/problems?page=1&limit=5000`, { signal: controller.signal })
			.then((r) => r.json())
			.then((data) => setAllProblems(data.problems || []))
			.catch(() => {});
		return () => controller.abort();
	}, [problemPage]);

	const handleProblemChange = (isForward: boolean) => {
		const currentOrder = problem?.order;
		if (currentOrder === undefined) return;

		const nextOrder = currentOrder + (isForward ? 1 : -1);
		const next = allProblems.find((p) => p.frontend_question_id === nextOrder);
		if (next) {
			router.push(`/problems/${next.slug}`);
		}
	};

	return (
		<nav className='relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7 border-b border-dark-divider-border-2'>
			<div className={`flex w-full items-center justify-between ${!problemPage ? "max-w-[1400px] mx-auto" : ""}`}>
				<Link href='/' className='h-[22px] flex-shrink-0'>
					<Image src='/logo-full.png' alt='Logo' height={100} width={100} />
				</Link>

				{/* Nav tabs (homepage only) */}
				{!problemPage && (
					<div className='hidden sm:flex items-center gap-1 ml-6'>
						{[
							{ label: "Problems", href: "/", active: true },
							{ label: "Contest", href: "#", active: false },
							{ label: "Discuss", href: "#", active: false },
						].map((tab) => (
							<Link
								key={tab.label}
								href={tab.href}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									tab.active
										? "text-brand-orange"
										: "text-gray-500 hover:text-gray-700 hover:bg-dark-fill-3"
								}`}
							>
								{tab.label}
								{tab.active && (
									<div className='h-0.5 bg-brand-orange rounded-full mt-0.5' />
								)}
							</Link>
						))}
					</div>
				)}

				{problemPage && (
					<div className='flex items-center gap-4 flex-1 justify-center'>
						<div
							className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
							onClick={() => handleProblemChange(false)}
						>
							<FaChevronLeft />
						</div>
						<Link
							href='/'
							className='flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer'
						>
							<div>
								<BsList />
							</div>
							<p>Problem List</p>
						</Link>
						<div
							className='flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer'
							onClick={() => handleProblemChange(true)}
						>
							<FaChevronRight />
						</div>
					</div>
				)}

				<div className='flex items-center space-x-4 flex-1 justify-end'>
					<div>
						<a
							href='https://www.buymeacoffee.com/burakorkmezz'
							target='_blank'
							rel='noreferrer'
							className='bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2'
						>
							Premium
						</a>
					</div>
					{!user && (
						<Link
							href='/auth'
							onClick={() => setAuthModalState((prev) => ({ ...prev, isOpen: true, type: "login" }))}
						>
							<button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
						</Link>
					)}
					{user && problemPage && <Timer />}
					{user && (
						<div className='cursor-pointer group relative'>
							<Image src='/avatar.png' alt='Avatar' width={30} height={30} className='rounded-full' />
							<div
								className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg
								z-40 group-hover:scale-100 scale-0
								transition-all duration-300 ease-in-out'
							>
								<p className='text-sm'>{user.email}</p>
							</div>
						</div>
					)}
					{user && <Logout />}
				</div>
			</div>
		</nav>
	);
};
export default Topbar;
