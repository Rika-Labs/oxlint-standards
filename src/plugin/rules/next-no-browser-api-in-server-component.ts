import type { RuleModule } from "../types.js";
import {
	hasProgramDirective,
	isAppRouterFile,
	isFixtureOrDocsFile,
	isTestFilename,
	toNode,
	walkAst,
} from "../utils.js";

const BROWSER_API_IDENTIFIERS = new Set([
	"window",
	"document",
	"localStorage",
	"sessionStorage",
	"navigator",
]);

export const nextNoBrowserApiInServerComponentRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow browser APIs in App Router server components.",
		},
		messages: {
			browserApi:
				"Browser APIs are not available in server components. Move this code behind 'use client' or a client-only boundary.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename) || isFixtureOrDocsFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isAppRouterFile(context.filename)) return;
				if (hasProgramDirective(node, "use client")) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "MemberExpression") return;
					const objectNode = toNode(candidate.object);
					if (!objectNode || objectNode.type !== "Identifier") return;
					if (!BROWSER_API_IDENTIFIERS.has(objectNode.name as string)) return;

					context.report({ node: candidate, messageId: "browserApi" });
				});
			},
		};
	},
};
