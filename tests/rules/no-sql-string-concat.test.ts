import { describe, expect, it } from "bun:test";
import { noSqlStringConcatRule } from "../../src/plugin/rules/no-sql-string-concat.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-sql-string-concat", () => {
	it("reports concatenated SQL query strings", () => {
		const { context, reports } = createTestContext();
		const visitor = noSqlStringConcatRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "db" }),
					property: asNode({ type: "Identifier", name: "query" }),
					computed: false,
				}),
				arguments: [
					asNode({
						type: "BinaryExpression",
						operator: "+",
						left: asNode({ type: "Literal", value: "select * from users where id = " }),
						right: asNode({ type: "Identifier", name: "id" }),
					}),
				],
			}),
		);

		expect(reports[0]?.messageId).toBe("sqlConcat");
	});

	it("ignores non-SQL string arguments", () => {
		const { context, reports } = createTestContext();
		const visitor = noSqlStringConcatRule.create(context);

		visitor.CallExpression?.(
			asNode({
				type: "CallExpression",
				callee: asNode({
					type: "MemberExpression",
					object: asNode({ type: "Identifier", name: "logger" }),
					property: asNode({ type: "Identifier", name: "info" }),
					computed: false,
				}),
				arguments: [asNode({ type: "Literal", value: "user loaded" })],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
