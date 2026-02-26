import Topbar from "@/components/Topbar/Topbar";
import { MOCK_CARL_CURRICULUM, MOCK_LINGSHEN_CURRICULUM } from "@/constants/mockData";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

import LeftSidebar from "@/components/HomePage/LeftSidebar";
import BannerCarousel from "@/components/HomePage/BannerCarousel";
import TopicTagsRow from "@/components/HomePage/TopicTagsRow";
import CategoryFilter from "@/components/HomePage/CategoryFilter";
import ProblemSearchBar from "@/components/HomePage/ProblemSearchBar";
import EnhancedProblemsTable from "@/components/HomePage/EnhancedProblemsTable";
import RightSidebar from "@/components/HomePage/RightSidebar";

import { SortOption } from "@/utils/types/homepage";


// Lazy-load: hidden by default, only rendered on tab switch
const GroupedProblemTable = dynamic(() => import("@/components/GroupedProblemTable/GroupedProblemTable"));

type ViewTab = "list" | "curriculum";

export default function Home() {
	const [viewTab, setViewTab] = useState<ViewTab>("list");
	const [activeCurriculum, setActiveCurriculum] = useState<"carl" | "lingshen">("carl");

	// Filter state
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<SortOption>("default");
	const [selectedTopicTag, setSelectedTopicTag] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState("All Topics");
	const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
	const [statusFilter, setStatusFilter] = useState("All");
	const [problemSlugs, setProblemSlugs] = useState<string[]>([]);

	// Stats from the problems table
	const [solvedCount, setSolvedCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	const handleStatsUpdate = useCallback((solved: number, total: number) => {
		setSolvedCount(solved);
		setTotalCount(total);
	}, []);

	const handleSlugsUpdate = useCallback((slugs: string[]) => {
		setProblemSlugs(slugs);
	}, []);

	return (
		<main className='bg-dark-layer-2 min-h-screen'>
			<Topbar />

			<div className='max-w-[1400px] mx-auto px-4 py-6'>
				<div className='grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_280px] gap-6'>
					{/* Left sidebar */}
					<div className='hidden lg:block sticky top-[62px] self-start max-h-[calc(100vh-74px)] overflow-y-auto'>
						<LeftSidebar />
					</div>

					{/* Main content */}
					<div className='space-y-4'>
						<BannerCarousel />

						<TopicTagsRow
							selectedTag={selectedTopicTag}
							onTagSelect={setSelectedTopicTag}
						/>

						<CategoryFilter
							activeCategory={activeCategory}
							onCategoryChange={setActiveCategory}
						/>

						<ProblemSearchBar
							search={search}
							onSearchChange={setSearch}
							sort={sort}
							onSortChange={setSort}
							solvedCount={solvedCount}
							totalCount={totalCount}
							difficultyFilter={difficultyFilter}
							onDifficultyFilterChange={setDifficultyFilter}
							statusFilter={statusFilter}
							onStatusFilterChange={setStatusFilter}
							problemSlugs={problemSlugs}
						/>

						{/* View toggle */}
						<div className='flex gap-1 bg-dark-fill-3 rounded-lg p-1 w-fit'>
							<button
								onClick={() => setViewTab("list")}
								className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
									viewTab === "list"
										? "bg-white text-gray-800 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								列表
							</button>
							<button
								onClick={() => setViewTab("curriculum")}
								className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
									viewTab === "curriculum"
										? "bg-white text-gray-800 shadow-sm"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								题单
							</button>
						</div>

						{viewTab === "list" && (
							<div className='bg-white rounded-lg border border-gray-200'>
								<EnhancedProblemsTable
									search={search}
									sort={sort}
									difficultyFilter={difficultyFilter}
									statusFilter={statusFilter}
									selectedTopicTag={selectedTopicTag}
									onStatsUpdate={handleStatsUpdate}
									onSlugsUpdate={handleSlugsUpdate}
								/>
							</div>
						)}

						{viewTab === "curriculum" && (
							<div>
								<div className='flex gap-3 mb-4'>
									<button
										onClick={() => setActiveCurriculum("carl")}
										className={`flex-1 px-4 py-3 rounded-lg border text-left transition-colors ${
											activeCurriculum === "carl"
												? "border-brand-orange bg-orange-50"
												: "border-gray-200 bg-white hover:border-gray-300"
										}`}
									>
										<p className={`text-sm font-medium ${activeCurriculum === "carl" ? "text-brand-orange" : "text-gray-800"}`}>
											代码随想录
										</p>
										<p className='text-xs text-gray-500 mt-0.5'>系统化刷题 · 10 大专题 · 150+ 题</p>
									</button>
									<button
										onClick={() => setActiveCurriculum("lingshen")}
										className={`flex-1 px-4 py-3 rounded-lg border text-left transition-colors ${
											activeCurriculum === "lingshen"
												? "border-brand-orange bg-orange-50"
												: "border-gray-200 bg-white hover:border-gray-300"
										}`}
									>
										<p className={`text-sm font-medium ${activeCurriculum === "lingshen" ? "text-brand-orange" : "text-gray-800"}`}>
											灵茶山艾府 · 科学刷题
										</p>
										<p className='text-xs text-gray-500 mt-0.5'>螺旋上升 · 7 大专题 · 100+ 题</p>
									</button>
								</div>
								<GroupedProblemTable
									modules={activeCurriculum === "carl" ? MOCK_CARL_CURRICULUM : MOCK_LINGSHEN_CURRICULUM}
								/>
							</div>
						)}
					</div>

					{/* Right sidebar */}
					<div className='hidden lg:block sticky top-[62px] self-start max-h-[calc(100vh-74px)] overflow-y-auto'>
						<RightSidebar />
					</div>
				</div>
			</div>
		</main>
	);
}
