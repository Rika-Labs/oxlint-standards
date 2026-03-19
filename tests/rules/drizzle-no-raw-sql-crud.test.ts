import { describe, expect, it } from "bun:test";
import { drizzleNoRawSqlCrudRule } from "../../src/plugin/rules/drizzle-no-raw-sql-crud.ts";
import {
	asNode,
	createTestContext,
	expressionStatementNode,
	identifierNode,
	importDeclarationNode,
	programNode,
} from "./helpers.ts";

const sqlTemplateNode = (text: string) =>
	asNode({
		type: "TaggedTemplateExpression",
		tag: identifierNode("sql"),
		quasi: asNode({
			type: "TemplateLiteral",
			quasis: [
				asNode({
					type: "TemplateElement",
					value: {
						raw: text,
						cooked: text,
					},
				}),
			],
			expressions: [],
		}),
	});

describe("drizzle-no-raw-sql-crud", () => {
	it("reports raw CRUD SQL templates", () => {
		const { context, reports } = createTestContext("src/domain/user-repo.ts");
		const visitor = drizzleNoRawSqlCrudRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(sqlTemplateNode("select * from users")),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows raw SQL in migration files", () => {
		const { context, reports } = createTestContext("src/db/migrations/001-users.ts");
		const visitor = drizzleNoRawSqlCrudRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("drizzle-orm"),
				expressionStatementNode(sqlTemplateNode("select * from users")),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
