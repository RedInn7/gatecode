export type TopicTagWithCount = {
	slug: string;
	name: string;
	count: number;
};

export type BannerCard = {
	id: string;
	title: string;
	subtitle: string;
	gradient: string;
	cta: string;
	href: string;
};

export type TrendingCompany = {
	name: string;
	slug: string;
	problemCount: number;
};

export type CalendarDay = {
	date: string; // YYYY-MM-DD
	count: number; // 0–4 intensity
};

export type StudyPlanItem = {
	id: string;
	title: string;
	icon: string;
	href: string;
	progress?: number; // 0–100
};

export type SortOption = "default" | "acceptance" | "difficulty" | "frequency" | "frontend_id";

export type ProblemFilterState = {
	search: string;
	difficulty: string[];
	status: string[];
	sort: SortOption;
};
