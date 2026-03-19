import { describe, expect, it } from "bun:test";
import { noDefaultExportInDomainRule } from "../../src/plugin/rules/no-default-export-in-domain.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-default-export-in-domain", () => {
	it("reports default export in domain file", () => {
		const { context, reports } = createTestContext("src/domain/user.ts");
		const visitor = noDefaultExportInDomainRule.create(context);

		visitor.ExportDefaultDeclaration?.(
			asNode({
				type: "ExportDefaultDeclaration",
				declaration: asNode({
					type: "FunctionDeclaration",
					id: asNode({ type: "Identifier", name: "createUser" }),
				}),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("does not report default export in non-domain file", () => {
		const { context } = createTestContext("src/api/handler.ts");
		const visitor = noDefaultExportInDomainRule.create(context);

		// visitor should be empty object for non-domain files
		expect(Object.keys(visitor)).toHaveLength(0);
	});

	it("does not report default export in domain test file", () => {
		const { context } = createTestContext("src/domain/user.test.ts");
		const visitor = noDefaultExportInDomainRule.create(context);

		// visitor should be empty object for test files
		expect(Object.keys(visitor)).toHaveLength(0);
	});
});
