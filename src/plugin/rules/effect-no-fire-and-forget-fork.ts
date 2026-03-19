import type { AstNode, RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, getNodeArray, getNode, toNode } from "../utils.js";

const hasEffectForkLastArg = (callExpr: AstNode): boolean => {
	const args = getNodeArray(callExpr, "arguments");
	const lastArg = args.length > 0 ? toNode(args[args.length - 1]) : null;
	if (!lastArg || lastArg.type !== "MemberExpression") return false;
	return getIdentifierName(lastArg.object) === "Effect" && getMemberPropertyName(lastArg) === "fork";
};

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

				// Direct: Effect.fork(task)
				if (callee.type === "MemberExpression") {
					const objName = getIdentifierName(callee.object);
					const propName = getMemberPropertyName(callee);

					if (objName === "Effect" && propName === "fork") {
						context.report({ node, messageId: "fireAndForget" });
						return;
					}

					// Method-chain: task.pipe(Effect.fork)
					if (propName === "pipe") {
						if (hasEffectForkLastArg(expr)) {
							context.report({ node, messageId: "fireAndForget" });
						}
						return;
					}
				}

				// Free function: pipe(task, Effect.fork)
				if (callee.type === "Identifier" && getIdentifierName(callee) === "pipe") {
					if (hasEffectForkLastArg(expr)) {
						context.report({ node, messageId: "fireAndForget" });
					}
				}
			},
		};
	},
};
