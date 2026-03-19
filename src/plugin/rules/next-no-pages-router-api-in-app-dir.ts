import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getLiteralString,
	getNodeArray,
	isAppRouterFile,
	isFixtureOrDocsFile,
	isTestFilename,
	toNode,
} from "../utils.js";

const PAGES_ROUTER_EXPORTS = new Set(["getServerSideProps", "getStaticProps", "getStaticPaths"]);

const isRestrictedExportName = (value: unknown): boolean => {
	const name = getIdentifierName(value);
	return name !== null && PAGES_ROUTER_EXPORTS.has(name);
};

export const nextNoPagesRouterApiInAppDirRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow legacy Pages Router APIs inside App Router directories.",
		},
		messages: {
			pagesRouterApi:
				"Legacy Pages Router APIs do not belong in app/ directories. Use App Router data fetching and routing primitives instead.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename) || isFixtureOrDocsFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isAppRouterFile(context.filename)) return;

				for (const statement of getNodeArray(node, "body")) {
					if (statement.type === "ImportDeclaration") {
						if (getLiteralString(statement.source) === "next/router") {
							context.report({ node: statement, messageId: "pagesRouterApi" });
						}
						continue;
					}

					if (statement.type !== "ExportNamedDeclaration") continue;
					const declaration = toNode(statement.declaration);
					if (declaration?.type === "FunctionDeclaration" && isRestrictedExportName(declaration.id)) {
						context.report({ node: statement, messageId: "pagesRouterApi" });
						continue;
					}

					if (declaration?.type === "VariableDeclaration") {
						for (const declarator of getNodeArray(declaration, "declarations")) {
							if (isRestrictedExportName(declarator.id)) {
								context.report({ node: statement, messageId: "pagesRouterApi" });
							}
						}
						continue;
					}

					for (const specifier of getNodeArray(statement, "specifiers")) {
						if (isRestrictedExportName(specifier.exported)) {
							context.report({ node: statement, messageId: "pagesRouterApi" });
						}
					}
				}
			},
		};
	},
};
