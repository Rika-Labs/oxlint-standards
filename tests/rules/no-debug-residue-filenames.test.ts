import { describe, expect, it } from "bun:test";
import { noDebugResidueFilenamesRule } from "../../src/plugin/rules/no-debug-residue-filenames.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-debug-residue-filenames", () => {
	it("reports backup-like filenames", () => {
		const { context, reports } = createTestContext("src/user_backup.ts");
		const visitor = noDebugResidueFilenamesRule.create(context);

		visitor.Program?.(asNode({ type: "Program" }));

		expect(reports[0]?.messageId).toBe("debugResidue");
	});

	it("ignores regular filenames", () => {
		const { context, reports } = createTestContext("src/user.ts");
		const visitor = noDebugResidueFilenamesRule.create(context);

		visitor.Program?.(asNode({ type: "Program" }));

		expect(reports).toHaveLength(0);
	});

	it("ignores filenames that merely contain temp or v2 as substrings", () => {
		const { context: templateContext, reports: templateReports } = createTestContext("src/template.ts");
		const templateVisitor = noDebugResidueFilenamesRule.create(templateContext);
		templateVisitor.Program?.(asNode({ type: "Program" }));

		const { context: versionContext, reports: versionReports } = createTestContext("src/api-v2.ts");
		const versionVisitor = noDebugResidueFilenamesRule.create(versionContext);
		versionVisitor.Program?.(asNode({ type: "Program" }));

		expect(templateReports).toHaveLength(0);
		expect(versionReports).toHaveLength(0);
	});
});
