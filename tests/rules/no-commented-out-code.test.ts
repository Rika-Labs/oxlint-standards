import { describe, expect, it } from "bun:test";
import { noCommentedOutCodeRule } from "../../src/plugin/rules/no-commented-out-code.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-commented-out-code", () => {
	it("reports comments that look like disabled code", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noCommentedOutCodeRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [asNode({ type: "Line", value: "const value = 1;" })],
			}),
		);

		expect(reports[0]?.messageId).toBe("commentedCode");
	});

	it("ignores normal explanatory comments", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noCommentedOutCodeRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [asNode({ type: "Line", value: "Return early on auth failure" })],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
