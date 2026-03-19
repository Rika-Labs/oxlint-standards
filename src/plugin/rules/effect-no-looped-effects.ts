import type { RuleModule } from "../types.js";
import { getCallChain, isLoopNode, serializeAstForComparison, walkAst } from "../utils.js";
import { isEffectFile } from "./effect-utils.js";

export const effectNoLoopedEffectsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow invoking Effect combinators inside imperative loops.",
		},
		messages: {
			loopedEffect:
				"Do not invoke Effect combinators inside loops. Prefer Effect.forEach, Effect.all, or declarative batching.",
		},
	},
	create(context) {
		return {
			Program(node) {
				if (!isEffectFile(node, context.filename)) return;

				const reported = new Set<string>();
				walkAst(node, (candidate) => {
					if (!isLoopNode(candidate)) return;

					walkAst(candidate, (inner) => {
						if (inner.type !== "CallExpression") return;
						const callChain = getCallChain(inner);
						if (!callChain || callChain.rootIdentifier !== "Effect") return;

						const serialization = serializeAstForComparison(inner);
						if (reported.has(serialization)) return;
						reported.add(serialization);
						context.report({ node: inner, messageId: "loopedEffect" });
					});
				});
			},
		};
	},
};
