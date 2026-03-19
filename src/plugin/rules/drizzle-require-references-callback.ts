import type { RuleModule } from "../types.js";
import { toNode, walkAst } from "../utils.js";
import { isDrizzleFile, isDrizzleIgnoredFile, isMethodCall } from "./drizzle-utils.js";

const REFERENCES_METHODS = new Set(["references"]);

export const drizzleRequireReferencesCallbackRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require callback form for Drizzle references(() => table.id).",
		},
		messages: {
			callbackRequired:
				"Use references(() => table.id) so foreign-key references stay lazy and avoid circular dependency issues.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					if (!isMethodCall(candidate, REFERENCES_METHODS)) return;

					const [firstArgument] = Array.isArray(candidate.arguments) ? candidate.arguments : [];
					const argumentNode = toNode(firstArgument);
					if (
						argumentNode &&
						(argumentNode.type === "ArrowFunctionExpression" ||
							argumentNode.type === "FunctionExpression")
					) {
						return;
					}

					context.report({ node: candidate, messageId: "callbackRequired" });
				});
			},
		};
	},
};
