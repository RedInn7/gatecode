import React, { useCallback, useEffect, useRef, useState } from "react";
import { MOCK_BANNERS } from "@/constants/homepageMockData";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BannerCarousel: React.FC = () => {
	const [current, setCurrent] = useState(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pausedRef = useRef(false);
	const total = MOCK_BANNERS.length;

	const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
	const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

	useEffect(() => {
		timerRef.current = setInterval(() => {
			if (!pausedRef.current) next();
		}, 5000);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [next]);

	const banner = MOCK_BANNERS[current];

	return (
		<div
			className='relative rounded-xl overflow-hidden'
			onMouseEnter={() => (pausedRef.current = true)}
			onMouseLeave={() => (pausedRef.current = false)}
		>
			{/* Banner content */}
			<div
				className={`bg-gradient-to-r ${banner.gradient} px-8 py-8 text-white transition-all duration-500`}
			>
				<h2 className='text-xl font-bold mb-1'>{banner.title}</h2>
				<p className='text-sm text-white/80 mb-4'>{banner.subtitle}</p>
				<a
					href={banner.href}
					className='inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/30 transition-colors'
				>
					{banner.cta}
				</a>
			</div>

			{/* Left / Right arrows */}
			<button
				onClick={prev}
				className='absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors'
			>
				<FaChevronLeft size={12} />
			</button>
			<button
				onClick={next}
				className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors'
			>
				<FaChevronRight size={12} />
			</button>

			{/* Dot indicators */}
			<div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
				{MOCK_BANNERS.map((_, i) => (
					<button
						key={i}
						onClick={() => setCurrent(i)}
						className={`w-2 h-2 rounded-full transition-all ${
							i === current ? "bg-white w-5" : "bg-white/50"
						}`}
					/>
				))}
			</div>
		</div>
	);
};

export default BannerCarousel;
