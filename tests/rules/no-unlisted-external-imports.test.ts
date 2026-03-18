import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { noUnlistedExternalImportsRule } from "../../src/plugin/rules/no-unlisted-external-imports.ts";
import type { ReportDescriptor, RuleContext } from "../../src/plugin/types.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-unlisted-external-imports", () => {
	it("reports package imports that are not in package.json", () => {
		const { context, reports } = createTestContext();
		const visitor = noUnlistedExternalImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "left-pad" }),
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("allows declared and local imports", () => {
		const { context, reports } = createTestContext();
		const visitor = noUnlistedExternalImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "typescript" }),
			}),
		);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "./local-module" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("uses nearest package.json for monorepo package files", () => {
		const filename = resolve(
			process.cwd(),
			"tests/fixtures/no-unlisted-external-imports/workspace-a/src/example.ts",
		);
		const { context, reports } = createTestContext(filename);
		const visitor = noUnlistedExternalImportsRule.create(context);

		visitor.ImportDeclaration?.(
			asNode({
				type: "ImportDeclaration",
				source: asNode({ type: "Literal", value: "left-pad" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("uses workspace package dependencies when filename is unavailable", () => {
		const previousCwd = process.cwd();
		const workspaceRoot = resolve(
			process.cwd(),
			"tests/fixtures/no-unlisted-external-imports/workspace-root",
		);
		const reports: Array<ReportDescriptor> = [];
		const context: RuleContext = {
			report: (descriptor) => {
				reports.push(descriptor);
			},
		};

		process.chdir(workspaceRoot);
		try {
			const visitor = noUnlistedExternalImportsRule.create(context);
			visitor.ImportDeclaration?.(
				asNode({
					type: "ImportDeclaration",
					source: asNode({ type: "Literal", value: "left-pad" }),
				}),
			);
		} finally {
			process.chdir(previousCwd);
		}

		expect(reports).toHaveLength(0);
	});
});
