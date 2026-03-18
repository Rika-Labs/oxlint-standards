import type { RuleModule } from "../types.js";
import { getIdentifierName, getNodeArray, isTestFilename, toNode } from "../utils.js";

const GENERIC_ERROR_CONSTRUCTORS = new Set([
	"Error",
	"TypeError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"URIError",
	"EvalError",
	"AggregateError",
]);

const isGenericErrorExpression = (value: unknown): boolean => {
	const node = toNode(value);
	if (!node) return false;

	if (node.type === "NewExpression") {
		const constructorName = getIdentifierName(node.callee);
		return constructorName !== null && GENERIC_ERROR_CONSTRUCTORS.has(constructorName);
	}

	if (node.type === "CallExpression") {
		const constructorName = getIdentifierName(node.callee);
		return constructorName !== null && GENERIC_ERROR_CONSTRUCTORS.has(constructorName);
	}

	return false;
};

export const effectNoGenericErrorFailRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow Effect.fail with generic JS Error constructors.",
		},
		messages: {
			forbidden:
				"Do not use generic Error constructors with Effect.fail. Use tagged or domain-specific errors.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				if (getIdentifierName(callee.object) !== "Effect") return;
				if (getIdentifierName(callee.property) !== "fail") return;

				const firstArgument = getNodeArray(node, "arguments")[0];
				if (!isGenericErrorExpression(firstArgument)) return;

				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
