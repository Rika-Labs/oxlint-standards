import { describe, expect, it } from "bun:test";
import { noCopyPasteExportsRule } from "../../src/plugin/rules/no-copy-paste-exports.ts";
import { asNode, createTestContext } from "./helpers.ts";

describe("no-copy-paste-exports", () => {
	it("reports two exported functions with identical bodies", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noCopyPasteExportsRule.create(context);

		const makeBody = (paramName: string) =>
			asNode({
				type: "BlockStatement",
				body: [
					asNode({
						type: "VariableDeclaration",
						kind: "const",
						declarations: [
							asNode({
								type: "VariableDeclarator",
								id: asNode({ type: "Identifier", name: "result" }),
								init: asNode({
									type: "CallExpression",
									callee: asNode({
										type: "MemberExpression",
										object: asNode({ type: "Identifier", name: "db" }),
										property: asNode({ type: "Identifier", name: "query" }),
									}),
									arguments: [
										asNode({ type: "Identifier", name: paramName }),
									],
								}),
							}),
						],
					}),
					asNode({
						type: "IfStatement",
						test: asNode({
							type: "UnaryExpression",
							operator: "!",
							argument: asNode({ type: "Identifier", name: "result" }),
						}),
						consequent: asNode({
							type: "BlockStatement",
							body: [
								asNode({
									type: "ThrowStatement",
									argument: asNode({
										type: "NewExpression",
										callee: asNode({ type: "Identifier", name: "Error" }),
										arguments: [asNode({ type: "Literal", value: "Not found" })],
									}),
								}),
							],
						}),
					}),
					asNode({
						type: "ReturnStatement",
						argument: asNode({ type: "Identifier", name: "result" }),
					}),
				],
			});

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "ExportNamedDeclaration",
						declaration: asNode({
							type: "FunctionDeclaration",
							id: asNode({ type: "Identifier", name: "getUser" }),
							body: makeBody("userId"),
						}),
					}),
					asNode({
						type: "ExportNamedDeclaration",
						declaration: asNode({
							type: "FunctionDeclaration",
							id: asNode({ type: "Identifier", name: "getOrder" }),
							body: makeBody("orderId"),
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(2);
		expect(reports[0]?.messageId).toBe("copyPaste");
		expect(reports[1]?.messageId).toBe("copyPaste");
	});

	it("does not report two exported functions with different bodies", () => {
		const { context, reports } = createTestContext("src/service.ts");
		const visitor = noCopyPasteExportsRule.create(context);

		visitor.Program?.(
			asNode({
				type: "Program",
				body: [
					asNode({
						type: "ExportNamedDeclaration",
						declaration: asNode({
							type: "FunctionDeclaration",
							id: asNode({ type: "Identifier", name: "getUser" }),
							body: asNode({
								type: "BlockStatement",
								body: [
									asNode({
										type: "ReturnStatement",
										argument: asNode({
											type: "CallExpression",
											callee: asNode({
												type: "MemberExpression",
												object: asNode({ type: "Identifier", name: "db" }),
												property: asNode({ type: "Identifier", name: "findUser" }),
											}),
											arguments: [asNode({ type: "Identifier", name: "id" })],
										}),
									}),
								],
							}),
						}),
					}),
					asNode({
						type: "ExportNamedDeclaration",
						declaration: asNode({
							type: "FunctionDeclaration",
							id: asNode({ type: "Identifier", name: "getOrder" }),
							body: asNode({
								type: "BlockStatement",
								body: [
									asNode({
										type: "ExpressionStatement",
										expression: asNode({
											type: "CallExpression",
											callee: asNode({
												type: "MemberExpression",
												object: asNode({ type: "Identifier", name: "console" }),
												property: asNode({ type: "Identifier", name: "log" }),
											}),
											arguments: [asNode({ type: "Literal", value: "fetching order" })],
										}),
									}),
									asNode({
										type: "ReturnStatement",
										argument: asNode({
											type: "CallExpression",
											callee: asNode({
												type: "MemberExpression",
												object: asNode({ type: "Identifier", name: "db" }),
												property: asNode({ type: "Identifier", name: "findOrder" }),
											}),
											arguments: [asNode({ type: "Identifier", name: "id" })],
										}),
									}),
								],
							}),
						}),
					}),
				],
			}),
		);

		expect(reports).toHaveLength(0);
	});
});
