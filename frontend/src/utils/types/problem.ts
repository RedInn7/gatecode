export type Example = {
	id: number;
	inputText: string;
	outputText: string;
	explanation?: string;
	img?: string;
};

// local problem data
export type Problem = {
	id: string;
	title: string;
	problemStatement: string;
	examples: Example[];
	constraints: string;
	order: number;
	difficulty?: string;
	starterCode: string;
	handlerFunction: ((fn: any) => boolean) | string;
	starterFunctionName: string;
	templateCodeMap?: Record<string, string>;
	solutions?: SolutionEntry[];
	editorial?: string;
};

export type DBProblem = {
	id: string;
	title: string;
	category: string;
	difficulty: string;
	likes: number;
	dislikes: number;
	order: number;
	videoId?: string;
	link?: string;
};

export type BackendProblemListItem = {
	id: number;
	frontend_question_id: number;
	title: string;
	slug: string;
	difficulty: string;
	is_vip_only: boolean;
};

export type BackendProblemDetail = {
	id: number;
	frontend_question_id: number;
	title: string;
	slug: string;
	difficulty: string;
	content: string;
	template_code: Record<string, string> | null;
	is_vip_only: boolean;
	is_acm_mode: boolean;
	solutions: SolutionEntry[] | null;
	editorial: string | null;
};

export type Tag = {
	id: string;
	name: string;
	type: "topic" | "company" | "position";
	is_vip_only: boolean;
};

export type CurriculumProblem = {
	id: number;
	title: string;
	slug: string;
	difficulty: "Easy" | "Medium" | "Hard";
	is_vip_only: boolean;
};

export type SubModule = {
	id: string;
	title: string;
	problems: CurriculumProblem[];
	is_vip_only: boolean;
};

export type Module = {
	id: string;
	title: string;
	description: string;
	subModules: SubModule[];
	is_vip_only: boolean;
};

export type Collection = {
	id: string;
	title: string;
	description: string;
	cover_image: string;
	difficulty_level: "Beginner" | "Intermediate" | "Advanced";
	problems: CurriculumProblem[];
	is_vip_only: boolean;
};

export type SolutionEntry = {
	language: string;
	langKey: string;
	code: string;
	timeComplexity?: string;
	spaceComplexity?: string;
};

export type TopicAbility = {
	topic: string;
	shortLabel: string;
	score: number;
	totalProblems: number;
	solvedProblems: number;
	passRate: number;
};
