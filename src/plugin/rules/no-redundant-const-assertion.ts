import type { RuleModule } from "../types.js";
import { isPrimitiveLiteralNode, toNode } from "../utils.js";

const isConstTypeAnnotation = (node: unknown): boolean => {
	const typeNode = toNode(node);
	if (!typeNode) return false;
	if (typeNode.type === "TSTypeReference") {
		return toNode(typeNode.typeName)?.type === "Identifier" &&
			(typeNode.typeName as { name?: string }).name === "const";
	}
	return typeNode.type === "TSLiteralType" &&
		toNode(typeNode.literal)?.type === "Identifier" &&
		(typeNode.literal as { name?: string }).name === "const";
};

export const noRedundantConstAssertionRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow redundant const assertions on primitive literals and other syntax-only cases.",
		},
		messages: {
			redundant:
				"Redundant 'as const' assertion adds no useful information here. Remove it.",
		},
	},
	create(context) {
		return {
			TSAsExpression(node) {
				if (!isConstTypeAnnotation(node.typeAnnotation)) return;
				if (!isPrimitiveLiteralNode(node.expression)) return;
				context.report({ node, messageId: "redundant" });
			},
		};
	},
};
