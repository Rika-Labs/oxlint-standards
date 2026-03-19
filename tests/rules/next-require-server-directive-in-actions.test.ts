import { describe, expect, it } from "bun:test";
import { nextRequireServerDirectiveInActionsRule } from "../../src/plugin/rules/next-require-server-directive-in-actions.ts";
import {
	asNode,
	createTestContext,
	exportNamedDeclarationNode,
	identifierNode,
	literalNode,
	programNode,
} from "./helpers.ts";

const exportedAsyncFunction = () =>
	exportNamedDeclarationNode(
		asNode({
			type: "FunctionDeclaration",
			id: identifierNode("createUserAction"),
			params: [],
			async: true,
			body: asNode({ type: "BlockStatement", body: [] }),
		}),
	);

describe("next-require-server-directive-in-actions", () => {
	it("reports action files without use server", () => {
		const { context, reports } = createTestContext("src/app/users/actions.ts");
		const visitor = nextRequireServerDirectiveInActionsRule.create(context);
		visitor.Program?.(programNode([exportedAsyncFunction()]));
		expect(reports).toHaveLength(1);
	});

	it("allows action files with use server", () => {
		const { context, reports } = createTestContext("src/app/users/actions.ts");
		const visitor = nextRequireServerDirectiveInActionsRule.create(context);
		visitor.Program?.(
			programNode([asNode({ type: "ExpressionStatement", expression: literalNode("use server") }), exportedAsyncFunction()]),
		);
		expect(reports).toHaveLength(0);
	});
});
