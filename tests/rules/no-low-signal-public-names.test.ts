import { describe, expect, it } from "bun:test";
import { noLowSignalPublicNamesRule } from "../../src/plugin/rules/no-low-signal-public-names.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-low-signal-public-names", () => {
	it("reports exported function with banned name processData", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noLowSignalPublicNamesRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "processData" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("lowSignal");
	});

	it("does not report exported function with domain-specific name", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noLowSignalPublicNamesRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "calculateTax" }),
				}),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports exported function matching generic pattern getData", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noLowSignalPublicNamesRule.create(context);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				declaration: asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "getData" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("lowSignal");
	});
});
