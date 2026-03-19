import type { RuleModule } from "../types.js";
import { getString, toNode, toNodeArray } from "../utils.js";

const DIRECTIVE_PATTERN =
	/\b(oxlint-disable|eslint-disable|@ts-ignore|@ts-expect-error)\b/;
const TICKET_PATTERN = /[A-Z]{2,}-\d+/;
const DIRECTIVE_SUFFIX_PATTERN = /^-(?:next-)?line$/;
const RULE_NAME_PATTERN = /^[@a-z][\w/-]*[-/][\w/-]*$/;
const MIN_RATIONALE_WORDS = 4;

const getCommentText = (value: unknown): string => {
	const commentNode = toNode(value);
	if (!commentNode) return "";

	const fromValue = getString(commentNode.value);
	if (fromValue) return fromValue;

	const fromRaw = getString(commentNode.raw);
	if (fromRaw) return fromRaw;

	return "";
};

export const noDisableWithoutRationaleRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require lint-disable and type-suppression comments to include a ticket reference or rationale.",
		},
		messages: {
			missingRationale:
				"{{directive}} comment must include a ticket reference or rationale.",
		},
	},
	create(context) {
		return {
			Program(node) {
				const comments = toNodeArray(node.comments);
				for (const comment of comments) {
					const text = getCommentText(comment);
					const match = DIRECTIVE_PATTERN.exec(text);
					if (!match) continue;

					const directive = match[1];
					if (!directive) continue;
					const afterDirective = text.slice(match.index + directive.length);

					if (TICKET_PATTERN.test(afterDirective)) continue;

					// Extract rationale: text after "--" separator, or all text with
					// directive suffixes and rule names filtered out
					const dashSplit = afterDirective.split("--");
					const rationaleText = dashSplit.length > 1
						? dashSplit.slice(1).join("--")
						: afterDirective;
					const rationaleWords = rationaleText
						.trim()
						.split(/\s+/)
						.filter((w) => w.length > 0)
						.filter((w) => !RULE_NAME_PATTERN.test(w) && !DIRECTIVE_SUFFIX_PATTERN.test(w));
					if (rationaleWords.length >= MIN_RATIONALE_WORDS) continue;

					context.report({
						node: comment,
						messageId: "missingRationale",
						data: { directive },
					});
				}
			},
		};
	},
};
