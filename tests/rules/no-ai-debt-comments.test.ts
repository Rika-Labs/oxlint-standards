import { describe, expect, it } from "bun:test";
import { noAiDebtCommentsRule } from "../../src/plugin/rules/no-ai-debt-comments.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-ai-debt-comments", () => {
	it("reports comments that combine AI attribution with TODO debt", () => {
		const { context, reports } = createTestContext();
		const visitor = noAiDebtCommentsRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "TODO: fix the AI generated fallback",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("forbidden");
	});

	it("ignores regular TODO comments without AI attribution", () => {
		const { context, reports } = createTestContext();
		const visitor = noAiDebtCommentsRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "TODO: refactor this parser",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
