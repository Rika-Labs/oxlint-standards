import type { RuleModule } from "../types.js";
import { getString, isFixtureOrDocsFile, isTestFilename, toNode, toNodeArray } from "../utils.js";

const PLACEHOLDER_PATTERN = /\b(TODO|FIXME|placeholder|implement.?later|mock.?data|lorem|ipsum)\b/i;
const BANNED_IDENTIFIERS = new Set(["foo", "bar", "baz", "qux"]);

const getCommentText = (value: unknown): string => {
	const n = toNode(value);
	if (!n) return "";
	return getString(n.value) ?? getString(n.raw) ?? "";
};

export const noPlaceholderImplementationRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow placeholder implementations, mock data tokens, and throwaway identifier names in production code.",
		},
		messages: {
			placeholder:
				"Placeholder '{{token}}' is forbidden in production code. Implement or remove it.",
			bannedIdentifier:
				"Identifier '{{name}}' is a placeholder name forbidden in production code.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (isFixtureOrDocsFile(context.filename)) return {};

		return {
			Program(node) {
				const comments = toNodeArray(node.comments);
				for (const comment of comments) {
					const text = getCommentText(comment);
					const match = PLACEHOLDER_PATTERN.exec(text);
					if (!match) continue;
					context.report({
						node: comment,
						messageId: "placeholder",
						data: { token: match[1] },
					});
				}
			},
			Literal(node) {
				const value = getString(node.value);
				if (!value) return;
				const match = PLACEHOLDER_PATTERN.exec(value);
				if (!match) return;
				context.report({
					node,
					messageId: "placeholder",
					data: { token: match[1] },
				});
			},
			Identifier(node) {
				const name = getString(node.name);
				if (!name) return;
				if (!BANNED_IDENTIFIERS.has(name)) return;
				context.report({
					node,
					messageId: "bannedIdentifier",
					data: { name },
				});
			},
		};
	},
};
