import { describe, expect, it } from "bun:test";
import { noTutorialCommentsRule } from "../../src/plugin/rules/no-tutorial-comments.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-tutorial-comments", () => {
	it("reports tutorial-style narration comments", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noTutorialCommentsRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [asNode({ type: "Line", value: "This checks if the user exists" })],
			}),
		);

		expect(reports[0]?.messageId).toBe("tutorial");
	});

	it("ignores terse meaningful comments", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noTutorialCommentsRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [asNode({ type: "Line", value: "Auth precondition" })],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
