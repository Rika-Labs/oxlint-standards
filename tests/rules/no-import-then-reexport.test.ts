import { describe, expect, it } from "bun:test";
import { noImportThenReexportRule } from "../../src/plugin/rules/no-import-then-reexport.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-import-then-reexport", () => {
	it("reports import then local re-export", () => {
		const { context, reports } = createTestContext("src/index.ts");
		const visitor = noImportThenReexportRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "./internal" }),
				specifiers: [
					asNode({
						type: "ImportSpecifier",
						local: asNode({ type: "Identifier", name: "createUser" }),
					}),
				],
			}),
		);

		visitor.ExportNamedDeclaration?.(
			asNode({
				type: "ExportNamedDeclaration",
				specifiers: [
					asNode({
						type: "ExportSpecifier",
						local: asNode({ type: "Identifier", name: "createUser" }),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
	});
});
