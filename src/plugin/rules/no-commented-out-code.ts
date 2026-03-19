import type { RuleModule } from "../types.js";
import { getCommentText, isFixtureOrDocsFile, isTestFilename, toNodeArray } from "../utils.js";

const COMMENTED_OUT_CODE_PATTERN =
	/^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=|^\s*return\s+[^/].*;?\s*$|^\s*import\s+.+\s+from\s+['"]|^\s*export\s+(?:const|function|class|type|interface)\b|^\s*(?:if|for|while|switch)\s*\(|^\s*class\s+[A-Za-z_$][\w$]*\s*\{|^\s*function\s+[A-Za-z_$][\w$]*\s*\(/m;

export const noCommentedOutCodeRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow comments that look like disabled code left in the file.",
		},
		messages: {
			commentedCode:
				"Comment looks like commented-out code. Delete it instead of keeping dead code in comments.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (isFixtureOrDocsFile(context.filename)) return {};

		return {
			Program(node) {
				for (const comment of toNodeArray(node.comments)) {
					if (!COMMENTED_OUT_CODE_PATTERN.test(getCommentText(comment))) continue;
					context.report({ node: comment, messageId: "commentedCode" });
				}
			},
		};
	},
};
