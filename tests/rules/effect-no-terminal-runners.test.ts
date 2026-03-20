import { describe, expect, it } from "bun:test";
import { effectNoTerminalRunnersRule } from "../../src/plugin/rules/effect-no-terminal-runners.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-terminal-runners", () => {
	it("reports Effect.runPromise in non-entry files", () => {
		const { context, reports } = createTestContext("src/domain/user-service.ts");
		const visitor = effectNoTerminalRunnersRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "runPromise" }),
				}),
			}),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows terminal runners in entry files", () => {
		const { context, reports } = createTestContext("src/main.ts");
		const visitor = effectNoTerminalRunnersRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "runPromise" }),
				}),
			}),
		);
		expect(reports).toHaveLength(0);
	});

	it("still reports terminal runners in ordinary index files", () => {
		const { context, reports } = createTestContext("src/domain/index.ts");
		const visitor = effectNoTerminalRunnersRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "runPromise" }),
				}),
			}),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows terminal runners in test helper files", () => {
		const { context, reports } = createTestContext("tests/helpers/runtime.ts");
		const visitor = effectNoTerminalRunnersRule.create(context);
		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "runPromise" }),
				}),
			}),
		);
		expect(reports).toHaveLength(0);
	});
});
