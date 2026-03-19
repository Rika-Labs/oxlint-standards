import type { RuleModule } from "../types.js";
import { extractFunctionName, getIdentifierName, getNode, isTestFilename } from "../utils.js";

export const effectNoPromiseServiceMethodsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Promise-returning and async methods in Effect service boundaries. Use Effect<T, E, R> instead.",
		},
		messages: {
			promiseReturn:
				"Service method '{{name}}' returns Promise<T>. Use Effect<T, E, R> in Effect service boundaries.",
			asyncMethod:
				"Service method '{{name}}' is async. Use Effect<T, E, R> instead of async/await in Effect service boundaries.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			MethodDefinition(node) {
				const methodName = extractFunctionName(node) ?? "anonymous";
				const fn = getNode(node, "value");
				if (!fn) return;

				if (fn.async === true) {
					context.report({
						node,
						messageId: "asyncMethod",
						data: { name: methodName },
					});
					return;
				}

				const returnType = getNode(fn, "returnType");
				if (!returnType) return;

				const typeAnnotation = getNode(returnType, "typeAnnotation");
				if (!typeAnnotation) return;

				if (typeAnnotation.type !== "TSTypeReference") return;
				const typeName = getIdentifierName(typeAnnotation.typeName);
				if (typeName !== "Promise") return;

				context.report({
					node,
					messageId: "promiseReturn",
					data: { name: methodName },
				});
			},
		};
	},
};
