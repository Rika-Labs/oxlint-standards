import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, getNodeArray, getNode, toNode } from "../utils.js";

export const effectNoFireAndForgetForkRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow discarding the result of Effect.fork. Assign the fiber, join it, or use a supervised fork.",
		},
		messages: {
			fireAndForget:
				"Effect.fork result is discarded. Assign the fiber to a variable, join it, or use a supervised fork.",
		},
	},
	create(context) {
		return {
			ExpressionStatement(node) {
				const expr = getNode(node, "expression");
				if (!expr || expr.type !== "CallExpression") return;

				const callee = toNode(expr.callee);
				if (!callee) return;

				if (callee.type === "MemberExpression") {
					const objName = getIdentifierName(callee.object);
					const propName = getMemberPropertyName(callee);

					if (objName === "Effect" && propName === "fork") {
						context.report({ node, messageId: "fireAndForget" });
						return;
					}

					if (propName === "pipe") {
						const args = getNodeArray(expr, "arguments");
						const lastArg = args[args.length - 1];
						if (!lastArg) return;
						const lastArgNode = toNode(lastArg);
						if (!lastArgNode || lastArgNode.type !== "MemberExpression") return;
						const lastObjName = getIdentifierName(lastArgNode.object);
						const lastPropName = getMemberPropertyName(lastArgNode);
						if (lastObjName === "Effect" && lastPropName === "fork") {
							context.report({ node, messageId: "fireAndForget" });
						}
					}
				}
			},
		};
	},
};
