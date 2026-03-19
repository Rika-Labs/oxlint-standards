import type { RuleModule } from "../types.js";
import { isLoopNode, serializeAstForComparison, walkAst } from "../utils.js";
import { isDrizzleFile, isDrizzleIgnoredFile, isDrizzleQueryCall } from "./drizzle-utils.js";

export const drizzleNoQueryInLoopsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow Drizzle queries inside imperative loops.",
		},
		messages: {
			queryInLoop:
				"Do not execute Drizzle queries inside loops. Batch first or compose with set-based operations.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				const reported = new Set<string>();
				walkAst(node, (candidate) => {
					if (!isLoopNode(candidate)) return;

					walkAst(candidate, (inner) => {
						if (!isDrizzleQueryCall(inner)) return;
						const serialization = serializeAstForComparison(inner);
						if (reported.has(serialization)) return;
						reported.add(serialization);
						context.report({ node: inner, messageId: "queryInLoop" });
					});
				});
			},
		};
	},
};
