import type { RuleModule } from "../types.js";
import { getCommentText, isFixtureOrDocsFile, isTestFilename, toNodeArray } from "../utils.js";

const TUTORIAL_COMMENT_PATTERN =
	/^\s*(this|here|we)\b.*\b(checks?|ensures?|handles?|returns?|gets?|sets?|does|validates?)\b/i;

export const noTutorialCommentsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow tutorial-style explanatory comments that restate obvious code.",
		},
		messages: {
			tutorial:
				"Tutorial-style explanatory comment detected. Remove the narration and keep the code direct.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (isFixtureOrDocsFile(context.filename)) return {};

		return {
			Program(node) {
				for (const comment of toNodeArray(node.comments)) {
					if (!TUTORIAL_COMMENT_PATTERN.test(getCommentText(comment))) continue;
					context.report({ node: comment, messageId: "tutorial" });
				}
			},
		};
	},
};
