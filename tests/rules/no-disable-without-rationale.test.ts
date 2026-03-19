import { describe, expect, it } from "bun:test";
import { noDisableWithoutRationaleRule } from "../../src/plugin/rules/no-disable-without-rationale.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-disable-without-rationale", () => {
	it("reports eslint-disable-next-line without rationale", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noDisableWithoutRationaleRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: " eslint-disable-next-line",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("missingRationale");
	});

	it("does not report eslint-disable-next-line with ticket reference", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noDisableWithoutRationaleRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: " eslint-disable-next-line -- ABC-123",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});

	it("reports oxlint-disable without rationale or ticket", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noDisableWithoutRationaleRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: " oxlint-disable some-rule",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("missingRationale");
	});

	it("reports eslint-disable with only rule names as words", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noDisableWithoutRationaleRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: " eslint-disable-next-line no-console no-alert no-debugger",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(1);
		expect(reports[0]?.messageId).toBe("missingRationale");
	});

	it("does not report oxlint-disable with a valid long rationale", () => {
		const { context, reports } = createTestContext("src/example.ts");
		const visitor = noDisableWithoutRationaleRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				comments: [
					asNode({
						type: "Line",
						value: " oxlint-disable some-rule -- this is a valid long rationale",
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
