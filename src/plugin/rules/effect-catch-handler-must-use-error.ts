import type { AstNode, RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	getNodeArray,
	getString,
	isFunctionValue,
	toNode,
	walkAst,
} from "../utils.js";

const EFFECT_CATCH_METHODS = new Set(["catch", "catchAll", "catchSome", "catchTag"]);

const functionBodyUsesIdentifier = (functionNode: AstNode, identifierName: string): boolean => {
	const body = toNode(functionNode.body);
	if (!body) return false;

	let found = false;
	walkAst(body, (candidate) => {
		if (found || candidate.type !== "Identifier") return;
		if (getString(candidate.name) === identifierName) {
			found = true;
		}
	});

	return found;
};

export const effectCatchHandlerMustUseErrorRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require Effect catch handlers to declare and use the error parameter so failure context is not discarded.",
		},
		messages: {
			missing:
				"Effect catch handlers must declare an error parameter and map failures explicitly.",
			unused:
				"Effect catch handler error parameter '{{name}}' is unused. Preserve failure context or rethrow.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				if (getIdentifierName(callee.object) !== "Effect") return;

				const methodName = getMemberPropertyName(callee);
				if (!methodName || !EFFECT_CATCH_METHODS.has(methodName)) return;

				const argumentsList = getNodeArray(node, "arguments");
				for (const argument of argumentsList) {
					if (!isFunctionValue(argument)) continue;

					const firstParameter = getNodeArray(argument, "params")[0];
					const parameterName = getIdentifierName(firstParameter);
					if (!parameterName) {
						context.report({ node: argument, messageId: "missing" });
						continue;
					}

					if (!functionBodyUsesIdentifier(argument, parameterName)) {
						context.report({
							node: argument,
							messageId: "unused",
							data: { name: parameterName },
						});
					}
				}
			},
		};
	},
};
