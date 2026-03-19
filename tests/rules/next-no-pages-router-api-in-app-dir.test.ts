import { describe, expect, it } from "bun:test";
import { nextNoPagesRouterApiInAppDirRule } from "../../src/plugin/rules/next-no-pages-router-api-in-app-dir.ts";
import {
	asNode,
	createTestContext,
	exportNamedDeclarationNode,
	identifierNode,
	importDeclarationNode,
	programNode,
} from "./helpers.ts";

describe("next-no-pages-router-api-in-app-dir", () => {
	it("reports legacy pages router exports in app", () => {
		const { context, reports } = createTestContext("src/app/users/page.tsx");
		const visitor = nextNoPagesRouterApiInAppDirRule.create(context);
		visitor.Program?.(
			programNode([
				exportNamedDeclarationNode(
					asNode({
						type: "FunctionDeclaration",
						id: identifierNode("getServerSideProps"),
						params: [],
						async: false,
						body: asNode({ type: "BlockStatement", body: [] }),
					}),
				),
			]),
		);
		expect(reports).toHaveLength(1);
	});

	it("allows legacy pages router exports outside app", () => {
		const { context, reports } = createTestContext("src/pages/users.tsx");
		const visitor = nextNoPagesRouterApiInAppDirRule.create(context);
		visitor.Program?.(
			programNode([
				importDeclarationNode("next/router"),
				exportNamedDeclarationNode(
					asNode({
						type: "FunctionDeclaration",
						id: identifierNode("getServerSideProps"),
						params: [],
						async: false,
						body: asNode({ type: "BlockStatement", body: [] }),
					}),
				),
			]),
		);
		expect(reports).toHaveLength(0);
	});
});
