import { describe, expect, it } from "bun:test";
import { noVagueVerbsRule } from "../../src/plugin/rules/no-vague-verbs.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-vague-verbs", () => {
	it("reports vague verb on function declaration", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noVagueVerbsRule.create(context);
		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "processData" }),
			}),
		);
		expect(reports).toHaveLength(1);
	});

	it("ignores explicit names", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noVagueVerbsRule.create(context);
		visitor.FunctionDeclaration?.(
			asNode({
				type: "FunctionDeclaration",
				id: asNode({ type: "Identifier", name: "createUserSession" }),
			}),
		);
		expect(reports).toHaveLength(0);
	});
});
