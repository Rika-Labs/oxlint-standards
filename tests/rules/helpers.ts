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

export const identifierNode = (name: string): AstNode =>
	asNode({ type: "Identifier", name });

export const literalNode = (value: string): AstNode =>
	asNode({ type: "Literal", value });

export const memberExpressionNode = (
	object: AstNode,
	property: string | AstNode,
	computed = false,
): AstNode =>
	asNode({
		type: "MemberExpression",
		object,
		property: typeof property === "string" ? identifierNode(property) : property,
		computed,
	});

export const callExpressionNode = (callee: AstNode, args: ReadonlyArray<AstNode> = []): AstNode =>
	asNode({
		type: "CallExpression",
		callee,
		arguments: [...args],
	});

export const methodCallNode = (
	object: AstNode,
	property: string,
	args: ReadonlyArray<AstNode> = [],
): AstNode => callExpressionNode(memberExpressionNode(object, property), args);

export const importDeclarationNode = (source: string): AstNode =>
	asNode({
		type: "ImportDeclaration",
		source: literalNode(source),
		specifiers: [],
	});

export const expressionStatementNode = (expression: AstNode): AstNode =>
	asNode({
		type: "ExpressionStatement",
		expression,
	});

export const exportNamedDeclarationNode = (
	declaration: AstNode,
	specifiers: ReadonlyArray<AstNode> = [],
): AstNode =>
	asNode({
		type: "ExportNamedDeclaration",
		declaration,
		specifiers: [...specifiers],
	});

export const programNode = (body: ReadonlyArray<AstNode>): AstNode =>
	asNode({
		type: "Program",
		body: [...body],
	});
