import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	getNodeArray,
	isFunctionValue,
	toNode,
} from "../utils.js";

export const effectNoAsyncInsideSyncRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow passing async functions to Effect.sync.",
		},
		messages: {
			asyncInSync:
				"Do not pass an async function to Effect.sync. Use Effect.promise or Effect.tryPromise instead.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;

				if (getIdentifierName(callee.object) !== "Effect") return;
				if (getMemberPropertyName(callee) !== "sync") return;

				const args = getNodeArray(node, "arguments");
				const arg = args[0];
				if (!arg) return;

				if (!isFunctionValue(arg)) return;
				if (arg.async !== true) return;

				context.report({ node, messageId: "asyncInSync" });
			},
		};
	},
};
