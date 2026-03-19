import { describe, expect, it } from "bun:test";
import { noTodoWithoutIssueRule } from "../../src/plugin/rules/no-todo-without-issue.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-todo-without-issue", () => {
	it("reports bare TODO comment without issue reference", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noTodoWithoutIssueRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "TODO: fix this later",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("bareToken");
	});

	it("does not report TODO with ticket reference in parentheses", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noTodoWithoutIssueRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "TODO(ABC-123): fix this later",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports FIXME comment without ticket reference", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noTodoWithoutIssueRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "FIXME: this is broken",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("bareToken");
	});

	it("does not report HACK with ticket reference in brackets", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noTodoWithoutIssueRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: "HACK[DEV-42]: temporary workaround",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
