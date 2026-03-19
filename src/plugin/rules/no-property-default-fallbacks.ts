import type { AstNode, RuleModule } from "../types.js";
import {
	getNode,
	isDefaultFallbackNode,
	isPropertyAccessLike,
	toNode,
	unwrapChainExpression,
} from "../utils.js";

const isPropertyFallback = (node: AstNode): boolean => {
	if (node.type === "LogicalExpression" && (node.operator === "||" || node.operator === "??")) {
		return isPropertyAccessLike(node.left) && isDefaultFallbackNode(node.right);
	}

	if (node.type !== "ConditionalExpression") return false;
	const consequent = toNode(node.consequent);
	const alternate = toNode(node.alternate);
	if (!consequent || !alternate) return false;

	return (
		isPropertyAccessLike(consequent) &&
		isDefaultFallbackNode(alternate) ||
		isPropertyAccessLike(alternate) &&
		isDefaultFallbackNode(consequent)
	);
};

export const noPropertyDefaultFallbacksRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow property access fallback defaults that hide unexpected missing or malformed data.",
		},
		messages: {
			fallback:
				"Do not hide missing property data with a default fallback. Validate shape explicitly and fail fast.",
		},
	},
	create(context) {
		const reportIfFallback = (node: AstNode): void => {
			if (!isPropertyFallback(node)) return;
			context.report({ node, messageId: "fallback" });
		};

		return {
			LogicalExpression(node) {
				reportIfFallback(node);
			},
			ConditionalExpression(node) {
				reportIfFallback(node);
			},
			VariableDeclarator(node) {
				const initNode = unwrapChainExpression(getNode(node, "init"));
				if (!initNode || !isPropertyFallback(initNode)) return;
				context.report({ node, messageId: "fallback" });
			},
		};
	},
};
