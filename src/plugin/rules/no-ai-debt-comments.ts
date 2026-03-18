import type { RuleModule } from "../types.js";
import { getString, toNode, toNodeArray } from "../utils.js";

const DEBT_TOKEN_PATTERN = /\b(todo|fixme|hack|temporary|later|cleanup)\b/i;
const AI_TOKEN_PATTERN = /\b(ai|llm|gpt|copilot|claude|gemini|cursor|generated)\b/i;

const getCommentText = (value: unknown): string => {
	const commentNode = toNode(value);
	if (!commentNode) return "";

	const fromValue = getString(commentNode.value);
	if (fromValue) return fromValue;

	const fromRaw = getString(commentNode.raw);
	if (fromRaw) return fromRaw;

	return "";
};

export const noAiDebtCommentsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow comments that acknowledge AI-generated debt without immediate resolution.",
		},
		messages: {
			forbidden:
				"AI debt comment is forbidden. Replace with immediate fix or a tracked issue reference outside source files.",
		},
	},
	create(context) {
		return {
			Program(node) {
				const comments = toNodeArray(node.comments);
				for (const comment of comments) {
					const text = getCommentText(comment);
					if (!DEBT_TOKEN_PATTERN.test(text) || !AI_TOKEN_PATTERN.test(text)) continue;
					context.report({ node: comment, messageId: "forbidden" });
				}
			},
		};
	},
};
