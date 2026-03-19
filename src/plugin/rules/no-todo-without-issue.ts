import type { RuleModule } from "../types.js";
import { getString, toNode, toNodeArray } from "../utils.js";

const TOKEN_PATTERN = /\b(TODO|FIXME|HACK)\b/i;
const TICKET_PATTERN = /\b(?:TODO|FIXME|HACK)\s*(?:\(|\[|:)\s*[A-Z]{2,}-\d+/i;

const getCommentText = (value: unknown): string => {
	const commentNode = toNode(value);
	if (!commentNode) return "";

	const fromValue = getString(commentNode.value);
	if (fromValue) return fromValue;

	const fromRaw = getString(commentNode.raw);
	if (fromRaw) return fromRaw;

	return "";
};

export const noTodoWithoutIssueRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require TODO/FIXME/HACK comments to include a tracked issue reference.",
		},
		messages: {
			bareToken:
				"{{token}} comment must include a tracked issue reference (e.g. TODO(ABC-123)).",
		},
	},
	create(context) {
		return {
			Program(node) {
				const comments = toNodeArray(node.comments);
				for (const comment of comments) {
					const text = getCommentText(comment);
					const match = TOKEN_PATTERN.exec(text);
					if (!match?.[1]) continue;
					if (TICKET_PATTERN.test(text)) continue;
					context.report({
						node: comment,
						messageId: "bareToken",
						data: { token: match[1].toUpperCase() },
					});
				}
			},
		};
	},
};
