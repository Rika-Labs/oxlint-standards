import { describe, expect, it } from "bun:test";
import { noRelativeCrossPackageImportsRule } from "../../src/plugin/rules/no-relative-cross-package-imports.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-relative-cross-package-imports", () => {
	it("does not report same-directory relative imports", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noRelativeCrossPackageImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "./utils" }),
				specifiers: [],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("does not report package imports (non-relative)", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noRelativeCrossPackageImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "@scope/pkg" }),
				specifiers: [],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
