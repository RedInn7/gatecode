import React, { useState, useMemo } from "react";
import { BsLock } from "react-icons/bs";
import { Tag } from "@/utils/types/problem";

type TagFilterProps = {
	tags: Tag[];
	selectedTags: string[];
	onTagChange: (tags: string[]) => void;
	isVip?: boolean;
};

const groupLabels: Record<string, string> = {
	topic: "算法分类",
	company: "公司真题",
	position: "保研/校招",
};

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onTagChange, isVip = false }) => {
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		if (!search.trim()) return tags;
		const q = search.trim().toLowerCase();
		return tags.filter((t) => t.name.toLowerCase().includes(q));
	}, [tags, search]);

	const groups = useMemo(() => {
		const map: Record<string, Tag[]> = { topic: [], company: [], position: [] };
		for (const tag of filtered) {
			if (map[tag.type]) map[tag.type].push(tag);
		}
		return map;
	}, [filtered]);

	const toggle = (tag: Tag) => {
		if (tag.is_vip_only && !isVip) return;
		const isSelected = selectedTags.includes(tag.id);
		if (isSelected) {
			onTagChange(selectedTags.filter((id) => id !== tag.id));
		} else {
			onTagChange([...selectedTags, tag.id]);
		}
	};

	return (
		<div className="space-y-3">
			{/* Search */}
			<input
				type="text"
				placeholder="搜索标签..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="w-full max-w-xs px-3 py-1.5 text-sm border border-dark-divider-border-2 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange"
			/>

			{/* Tag groups */}
			{(["topic", "company", "position"] as const).map((type) => {
				const typeTags = groups[type];
				if (typeTags.length === 0) return null;

				return (
					<div key={type}>
						<span className="text-xs text-gray-500 font-medium mb-1.5 block">
							{groupLabels[type]}
						</span>
						<div className="flex flex-wrap gap-2">
							{typeTags.map((tag) => {
								const isSelected = selectedTags.includes(tag.id);
								const isLocked = tag.is_vip_only && !isVip;

								return (
									<button
										key={tag.id}
										onClick={() => toggle(tag)}
										className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
											isSelected
												? "bg-brand-orange text-white"
												: isLocked
												? "bg-dark-fill-3 text-gray-400 cursor-not-allowed"
												: "bg-dark-fill-3 text-gray-700 hover:bg-dark-fill-2"
										}`}
									>
										{tag.name}
										{isLocked && <BsLock className="text-[10px]" />}
									</button>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default TagFilter;
