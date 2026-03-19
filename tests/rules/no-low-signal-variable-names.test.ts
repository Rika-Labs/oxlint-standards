import { describe, expect, it } from "bun:test";
import { noLowSignalVariableNamesRule } from "../../src/plugin/rules/no-low-signal-variable-names.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-low-signal-variable-names", () => {
	it("reports top-level locals with low-signal names", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noLowSignalVariableNamesRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "VariableDeclaration",
						declarations: [
							asNode({
								type: "VariableDeclarator",
								id: asNode({ type: "Identifier", name: "data" }),
							}),
						],
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("lowSignal");
	});

	it("reports named function parameters with low-signal names", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noLowSignalVariableNamesRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "FunctionDeclaration",
						id: asNode({ type: "Identifier", name: "saveProfile" }),
						params: [asNode({ type: "Identifier", name: "result" })],
						body: asNode({ type: "BlockStatement", body: [] }),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("lowSignal");
	});

	it("ignores test files", () => {
		const { context } = createTestContext("src/service.test.ts");
		const visitor = noLowSignalVariableNamesRule.create(context);

		expect(visitor.Program).toBeUndefined();
	});
});
