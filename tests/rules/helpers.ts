import type { AstNode, ReportDescriptor, RuleContext } from "../../src/plugin/types.ts";

export type TestContext = {
	readonly reports: Array<ReportDescriptor>;
	readonly context: RuleContext;
};

export const createTestContext = (filename = "src/example.ts"): TestContext => {
	const reports: Array<ReportDescriptor> = [];
	const context: RuleContext = {
		filename,
		report: (descriptor) => {
			reports.push(descriptor);
		},
	};

	return {
		reports,
		context,
	};
};

export const asNode = (node: Omit<AstNode, "type"> & { readonly type: string }): AstNode => node;
