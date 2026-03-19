import type { RuleModule } from "../types.js";
import { serializeAstForComparison, walkAst } from "../utils.js";
import { collectSafeEffectBoundarySerializations, isEffectFile } from "./effect-utils.js";

const isAsyncFunctionNode = (node: { readonly type?: string; readonly async?: unknown }): boolean =>
	(node.type === "ArrowFunctionExpression" ||
		node.type === "FunctionExpression" ||
		node.type === "FunctionDeclaration") &&
	node.async === true;

export const effectNoAsyncAwaitRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow async/await in Effect modules outside approved Effect.tryPromise boundaries.",
		},
		messages: {
			asyncAwait:
				"Prefer Effect.gen and Effect combinators over async/await in Effect modules.",
		},
	},
	create(context) {
		return {
			Program(node) {
				if (!isEffectFile(node, context.filename)) return;

				const safeBoundaries = collectSafeEffectBoundarySerializations(node);
				walkAst(node, (candidate) => {
					if (candidate.type === "AwaitExpression") {
						if (safeBoundaries.has(serializeAstForComparison(candidate))) return;
						context.report({ node: candidate, messageId: "asyncAwait" });
						return;
					}

					if (!isAsyncFunctionNode(candidate)) return;
					if (safeBoundaries.has(serializeAstForComparison(candidate))) return;

					context.report({ node: candidate, messageId: "asyncAwait" });
				});
			},
		};
	},
};
