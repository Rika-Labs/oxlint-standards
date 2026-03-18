import type { RuleModule } from "../types.js";
import { getIdentifierName, getNode, getNodeArray, toNode } from "../utils.js";

export const noCatchReturnErrorObjectRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow returning the caught error object directly from catch blocks, which silently converts failures to values.",
		},
		messages: {
			forbidden:
				"Catch block returns the caught error object. Rethrow or convert to a typed failure instead.",
		},
	},
	create(context) {
		return {
			CatchClause(node) {
				const catchParameter = toNode(node.param);
				const catchParameterName = getIdentifierName(catchParameter);
				if (!catchParameterName) return;

				const body = getNode(node, "body");
				if (!body || body.type !== "BlockStatement") return;

				for (const statement of getNodeArray(body, "body")) {
					if (statement.type !== "ReturnStatement") continue;
					const argumentName = getIdentifierName(statement.argument);
					if (argumentName === catchParameterName) {
						context.report({ node: statement, messageId: "forbidden" });
						return;
					}
				}
			},
		};
	},
};
