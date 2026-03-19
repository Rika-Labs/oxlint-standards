import { describe, expect, it } from "bun:test";
import { effectNoAsyncInsideSyncRule } from "../../src/plugin/rules/effect-no-async-inside-sync.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("effect-no-async-inside-sync", () => {
	it("reports async arrow function passed to Effect.sync", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = effectNoAsyncInsideSyncRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "sync" }),
				}),
				arguments: [
					asNode({
						type: "ArrowFunctionExpression",
						async: true,
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("asyncInSync");
	});

	it("does not report non-async arrow function passed to Effect.sync", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = effectNoAsyncInsideSyncRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "sync" }),
				}),
				arguments: [
					asNode({
						type: "ArrowFunctionExpression",
						async: false,
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("does not report async function passed to Effect.promise", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = effectNoAsyncInsideSyncRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "Effect" }),
					property: asNode({ type: "Identifier", name: "promise" }),
				}),
				arguments: [
					asNode({
						type: "ArrowFunctionExpression",
						async: true,
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
