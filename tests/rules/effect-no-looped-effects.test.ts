import { describe, expect, it } from "bun:test";
import { effectNoLoopedEffectsRule } from "../../src/plugin/rules/effect-no-looped-effects.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	methodCallNode,
	programNode,
} from "./helpers.ts";

describe("effect-no-looped-effects", () => {
	it("reports Effect calls inside loops", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoLoopedEffectsRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				asNode({
					type: "ForStatement",
					init: null,
					test: null,
					update: null,
					body: asNode({
						type: "BlockStatement",
						body: [expressionStatementNode(methodCallNode(identifierNode("Effect"), "map"))],
					}),
				}),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows Effect calls outside loops", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoLoopedEffectsRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("effect"),
				expressionStatementNode(methodCallNode(identifierNode("Effect"), "map")),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
