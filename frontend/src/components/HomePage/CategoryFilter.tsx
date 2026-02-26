import React from "react";
import { MOCK_CATEGORIES } from "@/constants/homepageMockData";

type CategoryFilterProps = {
	activeCategory: string;
	onCategoryChange: (category: string) => void;
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({
	activeCategory,
	onCategoryChange,
}) => {
	return (
		<div className='flex gap-1 flex-wrap'>
			{MOCK_CATEGORIES.map((cat) => (
				<button
					key={cat}
					onClick={() => onCategoryChange(cat)}
					className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
						activeCategory === cat
							? "bg-gray-800 text-white"
							: "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
					}`}
				>
					{cat}
				</button>
			))}
		</div>
	);
};

export default CategoryFilter;
