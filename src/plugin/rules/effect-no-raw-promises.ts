import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, toNode, walkAst } from "../utils.js";
import { isEffectFile } from "./effect-utils.js";

const PROMISE_CHAIN_METHODS = new Set(["then", "catch", "finally"]);

export const effectNoRawPromisesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow raw Promise construction and chaining in Effect modules. Use Effect.tryPromise, Effect.promise, or Effect.gen.",
		},
		messages: {
			rawPromise:
				"Do not use raw Promise construction or chaining in Effect modules. Prefer Effect.tryPromise, Effect.promise, or Effect.gen.",
		},
	},
	create(context) {
		return {
			Program(node) {
				if (!isEffectFile(node, context.filename)) return;

				walkAst(node, (candidate) => {
					if (
						candidate.type === "NewExpression" &&
						getIdentifierName(candidate.callee) === "Promise"
					) {
						context.report({ node: candidate, messageId: "rawPromise" });
						return;
					}

					if (candidate.type !== "CallExpression") return;
					const callee = toNode(candidate.callee);
					if (!callee || callee.type !== "MemberExpression") return;
					const methodName = getMemberPropertyName(callee);
					if (!methodName || !PROMISE_CHAIN_METHODS.has(methodName)) return;

					context.report({ node: candidate, messageId: "rawPromise" });
				});
			},
		};
	},
};
