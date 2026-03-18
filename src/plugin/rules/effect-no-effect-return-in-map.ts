import type { AstNode, RuleModule } from "../types.js";
import {
	getMemberPropertyName,
	getNodeArray,
	isEffectCallExpression,
	toNode,
} from "../utils.js";

const ITERATOR_METHODS = new Set(["map", "filter", "forEach"]);

const callbackReturnsEffect = (callbackNode: AstNode): boolean => {
	if (callbackNode.type !== "ArrowFunctionExpression" && callbackNode.type !== "FunctionExpression") {
		return false;
	}

	const body = toNode(callbackNode.body);
	if (!body) return false;

	if (body.type !== "BlockStatement") {
		return isEffectCallExpression(body);
	}

	const statements = getNodeArray(body, "body");
	for (const statement of statements) {
		if (statement.type !== "ReturnStatement") continue;
		if (isEffectCallExpression(statement.argument)) return true;
	}

	return false;
};

export const effectNoEffectReturnInMapRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow returning Effect values from array iterator callbacks. Compose effects explicitly.",
		},
		messages: {
			forbidden:
				"Do not return Effect values from {{method}} callbacks. Compose with Effect.forEach/Effect.all instead.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;

				const methodName = getMemberPropertyName(callee);
				if (!methodName || !ITERATOR_METHODS.has(methodName)) return;

				const callback = getNodeArray(node, "arguments")[0];
				const callbackNode = toNode(callback);
				if (!callbackNode || !callbackReturnsEffect(callbackNode)) return;

				context.report({
					node,
					messageId: "forbidden",
					data: {
						method: methodName,
					},
				});
			},
		};
	},
};
