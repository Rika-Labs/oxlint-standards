import type { AstNode, RuleModule } from "../types.js";
import { getNode, isFunctionValue, walkAst } from "../utils.js";
import {
	countWriteCalls,
	hasTransactionCall,
	isDrizzleFile,
	isDrizzleIgnoredFile,
} from "./drizzle-utils.js";

const getFunctionBody = (node: AstNode): AstNode | null => {
	if (node.type === "FunctionDeclaration" || isFunctionValue(node)) {
		return getNode(node, "body");
	}

	return null;
};

export const drizzleRequireTransactionScopeRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require transactions around functions that perform multiple Drizzle writes.",
		},
		messages: {
			missingTransaction:
				"Wrap multi-statement Drizzle write operations in db.transaction(...) or SqlClient.withTransaction.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				walkAst(node, (candidate) => {
					const body = getFunctionBody(candidate);
					if (!body) return;

					if (countWriteCalls(body) < 2) return;
					if (hasTransactionCall(body)) return;

					context.report({ node: candidate, messageId: "missingTransaction" });
				});
			},
		};
	},
};
