import type { AstNode, RuleModule } from "../types.js";
import { getNode, getNodeArray, isDefaultFallbackNode, toNode } from "../utils.js";

const hasThrowStatement = (statements: ReadonlyArray<AstNode>): boolean => {
	for (const statement of statements) {
		if (statement.type === "ThrowStatement") return true;
	}
	return false;
};

export const noSilentCatchFallbackRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow catch blocks that swallow errors or return fallback defaults instead of propagating failures.",
		},
		messages: {
			empty: "Empty catch block is forbidden. Propagate or handle the error explicitly.",
			fallback:
				"Catch block returns a fallback value. Do not silently recover from failures in strict mode.",
			swallow:
				"Catch block does not rethrow and may swallow failures. Throw, fail, or return a typed error.",
		},
	},
	create(context) {
		return {
			CatchClause(node) {
				const body = getNode(node, "body");
				if (!body || body.type !== "BlockStatement") return;

				const statements = getNodeArray(body, "body");
				if (statements.length === 0) {
					context.report({ node, messageId: "empty" });
					return;
				}

				let sawFallbackReturn = false;
				for (const statement of statements) {
					if (statement.type !== "ReturnStatement") continue;
					const argumentNode = toNode(statement.argument);
					if (isDefaultFallbackNode(argumentNode)) {
						sawFallbackReturn = true;
						break;
					}
				}

				if (sawFallbackReturn) {
					context.report({ node, messageId: "fallback" });
					return;
				}

				if (!hasThrowStatement(statements)) {
					context.report({ node, messageId: "swallow" });
				}
			},
		};
	},
};
