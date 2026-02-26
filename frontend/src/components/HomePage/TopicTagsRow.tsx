import React, { useRef } from "react";
import { MOCK_TOPIC_TAGS_WITH_COUNT } from "@/constants/homepageMockData";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type TopicTagsRowProps = {
	selectedTag: string | null;
	onTagSelect: (slug: string | null) => void;
};

const TopicTagsRow: React.FC<TopicTagsRowProps> = ({ selectedTag, onTagSelect }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	const scroll = (dir: "left" | "right") => {
		if (!scrollRef.current) return;
		const amount = 200;
		scrollRef.current.scrollBy({
			left: dir === "left" ? -amount : amount,
			behavior: "smooth",
		});
	};

	return (
		<div className='relative group'>
			{/* Scroll left */}
			<button
				onClick={() => scroll("left")}
				className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity'
			>
				<FaChevronLeft size={10} />
			</button>

			{/* Tags row */}
			<div
				ref={scrollRef}
				className='flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1'
			>
				{MOCK_TOPIC_TAGS_WITH_COUNT.map((tag) => (
					<button
						key={tag.slug}
						onClick={() =>
							onTagSelect(selectedTag === tag.slug ? null : tag.slug)
						}
						className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
							selectedTag === tag.slug
								? "bg-brand-orange text-white border-brand-orange"
								: "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
						}`}
					>
						{tag.name}
						<span className='ml-1.5 text-[10px] opacity-60'>{tag.count}</span>
					</button>
				))}
			</div>

			{/* Scroll right */}
			<button
				onClick={() => scroll("right")}
				className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity'
			>
				<FaChevronRight size={10} />
			</button>
		</div>
	);
};

export default TopicTagsRow;
