import type { AstNode, RuleModule } from "../types.js";
import {
	getNode,
	isDefaultFallbackNode,
	isPropertyAccessLike,
	serializeAstForComparison,
	toNode,
	unwrapChainExpression,
} from "../utils.js";

const hasMatchingPropertyGuard = (test: AstNode | null, propertyNode: AstNode): boolean => {
	if (!test) return false;

	const propertyShape = serializeAstForComparison(unwrapChainExpression(propertyNode));
	if (propertyShape.length === 0) return false;

	const current = unwrapChainExpression(test);
	if (!current) return false;
	if (serializeAstForComparison(current) === propertyShape) return true;

	if (current.type === "UnaryExpression") {
		return hasMatchingPropertyGuard(toNode(current.argument), propertyNode);
	}

	if (current.type === "LogicalExpression") {
		return (
			hasMatchingPropertyGuard(toNode(current.left), propertyNode) ||
			hasMatchingPropertyGuard(toNode(current.right), propertyNode)
		);
	}

	if (current.type === "BinaryExpression") {
		return (
			serializeAstForComparison(unwrapChainExpression(current.left)) === propertyShape ||
			serializeAstForComparison(unwrapChainExpression(current.right)) === propertyShape
		);
	}

	return false;
};

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
		isDefaultFallbackNode(alternate) &&
		hasMatchingPropertyGuard(toNode(node.test), consequent) ||
		isPropertyAccessLike(alternate) &&
		isDefaultFallbackNode(consequent) &&
		hasMatchingPropertyGuard(toNode(node.test), alternate)
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
