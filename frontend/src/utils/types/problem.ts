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
};
