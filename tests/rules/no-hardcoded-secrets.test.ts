import { describe, expect, it } from "bun:test";
import { noHardcodedSecretsRule } from "../../src/plugin/rules/no-hardcoded-secrets.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-hardcoded-secrets", () => {
	it("reports secret-like variable assignments", () => {
		const { context, reports } = createTestContext();
		const visitor = noHardcodedSecretsRule.create(context);

		visitor.VariableDeclarator?.(
			asNode({
				type: "VariableDeclarator",
				id: asNode({ type: "Identifier", name: "apiKey" }),
				init: asNode({ type: "Literal", value: "secret-123" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("secret");
	});

	it("reports secret-like object properties", () => {
		const { context, reports } = createTestContext();
		const visitor = noHardcodedSecretsRule.create(context);

		visitor.Property?.(
			asNode({
				type: "Property",
				key: asNode({ type: "Identifier", name: "password" }),
				value: asNode({ type: "Literal", value: "hunter2" }),
			}),
		);

		expect(reports[0]?.messageId).toBe("secret");
	});

	it("ignores ordinary string literals", () => {
		const { context, reports } = createTestContext();
		const visitor = noHardcodedSecretsRule.create(context);

		visitor.VariableDeclarator?.(
			asNode({
				type: "VariableDeclarator",
				id: asNode({ type: "Identifier", name: "endpoint" }),
				init: asNode({ type: "Literal", value: "https://api.example.com" }),
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
