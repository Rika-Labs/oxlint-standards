import { describe, expect, it } from "bun:test";
import { noStandaloneClassesRule } from "../../src/plugin/rules/no-standalone-classes.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-standalone-classes", () => {
	it("reports classes without extends", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noStandaloneClassesRule.create(context);

		visitor.ClassDeclaration?.(
			asNode({
				type: "ClassDeclaration",
				id: asNode({ type: "Identifier", name: "Manager" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("standalone");
	});

	it("ignores inherited classes", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noStandaloneClassesRule.create(context);

		visitor.ClassDeclaration?.(
			asNode({
				type: "ClassDeclaration",
				id: asNode({ type: "Identifier", name: "Manager" }),
				superClass: asNode({ type: "Identifier", name: "BaseManager" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
