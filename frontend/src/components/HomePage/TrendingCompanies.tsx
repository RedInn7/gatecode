import React, { useState } from "react";
import { COMPANY_TAGS } from "@/constants/leetcodeScrapedData";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";

const TrendingCompanies: React.FC = () => {
	const [search, setSearch] = useState("");

	const topCompanies = COMPANY_TAGS.slice(0, 15);
	const filtered = topCompanies.filter((c) =>
		c.name.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className='bg-white rounded-lg border border-gray-200 p-4'>
			<h3 className='text-sm font-semibold text-gray-800 mb-3'>Trending Companies</h3>

			<div className='relative mb-3'>
				<FiSearch className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400' size={12} />
				<input
					type='text'
					placeholder='Search companies...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='w-full pl-7 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-brand-orange text-gray-600 placeholder-gray-400'
				/>
			</div>

			<div className='flex flex-wrap gap-2'>
				{filtered.map((company) => (
					<Link
						key={company.slug}
						href={`/company/${company.slug}`}
						target='_blank'
						className='flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 hover:border-brand-orange hover:text-brand-orange transition-colors'
					>
						<CompanyLogo slug={company.slug} name={company.name} size={18} />
						<span>{company.name}</span>
						<span className='text-[10px] text-gray-400'>{company.questionCount}</span>
					</Link>
				))}
			</div>
		</div>
	);
};

export default TrendingCompanies;
