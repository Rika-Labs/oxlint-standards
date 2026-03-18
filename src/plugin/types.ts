export type AstNode = {
	readonly type: string;
	readonly [key: string]: unknown;
};

export type ReportData = Record<string, string | number | boolean | null | undefined>;

export type ReportDescriptor = {
	readonly node?: AstNode;
	readonly message?: string;
	readonly messageId?: string;
	readonly data?: ReportData;
};

export type RuleContext = {
	readonly filename?: string;
	report: (descriptor: ReportDescriptor) => void;
};

export type RuleVisitor = Partial<Record<string, (node: AstNode) => void>>;

export type RuleMeta = {
	readonly type?: "problem" | "suggestion" | "layout";
	readonly docs?: {
		readonly description?: string;
	};
	readonly messages?: Record<string, string>;
};

export type RuleModule = {
	readonly meta?: RuleMeta;
	create: (context: RuleContext) => RuleVisitor;
};
