import React from "react";
import Link from "next/link";
import { STUDY_PLANS } from "@/constants/leetcodeScrapedData";
import { AiOutlineStar } from "react-icons/ai";
import { FiList, FiExternalLink, FiBookOpen } from "react-icons/fi";

const EXAM_PREP_LINKS = [
	{ label: "THU 912", icon: "🏫", href: "https://leetcode.cn/problem-list/thu912/" },
	{ label: "PKU Machine Test", icon: "🎓", href: "https://leetcode.cn/problem-list/pku/" },
	{ label: "ZJU PAT", icon: "📝", href: "https://leetcode.cn/problem-list/zjupat/" },
	{ label: "408 DS", icon: "📚", href: "https://leetcode.cn/problem-list/408/" },
];

const SIDEBAR_PLANS = [
	{ slug: "top-interview-150", icon: "🎯" },
	{ slug: "leetcode-75", icon: "🔥" },
	{ slug: "30-days-of-javascript", icon: "⚡" },
	{ slug: "programming-skills", icon: "📚" },
	{ slug: "introduction-to-pandas", icon: "🐼" },
];

const LeftSidebar: React.FC = () => {
	return (
		<aside className='space-y-6'>
			{/* Study Plans */}
			<div>
				<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1'>
					Study Plan
				</h3>
				<ul className='space-y-1'>
					{SIDEBAR_PLANS.map((item) => {
						const plan = STUDY_PLANS[item.slug];
						if (!plan) return null;
						const totalProblems = plan.groups.reduce((s, g) => s + g.problems.length, 0);

						return (
							<li key={item.slug}>
								<Link
									href={`/studyplan/${item.slug}`}
									target='_blank'
									className='w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-left transition-colors text-gray-700 hover:bg-dark-fill-3'
								>
									<span className='text-base'>{item.icon}</span>
									<span className='flex-1 truncate'>{plan.name}</span>
									<span className='text-xs text-gray-400'>{totalProblems}</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>

			{/* Divider */}
			<div className='border-t border-dark-divider-border-2' />

			{/* My Lists */}
			<div>
				<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1'>
					My Lists
				</h3>
				<ul className='space-y-1'>
					<li>
						<a
							href='#'
							className='flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-dark-fill-3 transition-colors'
						>
							<AiOutlineStar className='text-yellow-500' />
							<span>Favorite</span>
						</a>
					</li>
					<li>
						<a
							href='#'
							className='flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-dark-fill-3 transition-colors'
						>
							<FiList className='text-gray-400' />
							<span>My Problem List</span>
						</a>
					</li>
				</ul>
			</div>

			{/* Divider */}
			<div className='border-t border-dark-divider-border-2' />

			{/* 保研/考研 */}
			<div>
				<h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-1.5'>
					<FiBookOpen className='text-sm' />
					Exam Prep
				</h3>
				<ul className='space-y-1'>
					{EXAM_PREP_LINKS.map((item) => (
						<li key={item.label}>
							<a
								href={item.href}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-dark-fill-3 transition-colors'
							>
								<span className='text-base'>{item.icon}</span>
								<span className='flex-1 truncate'>{item.label}</span>
								<FiExternalLink className='text-gray-300 flex-shrink-0' size={12} />
							</a>
						</li>
					))}
				</ul>
			</div>
		</aside>
	);
};

export default LeftSidebar;
