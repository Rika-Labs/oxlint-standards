import type { AstNode, RuleModule } from "../types.js";
import { getIdentifierName, getNode, getNodeArray, toNode } from "../utils.js";

const usesIdentifierAsImmediateValue = (node: AstNode, name: string): boolean => {
	if (node.type === "ReturnStatement") {
		return getIdentifierName(node.argument) === name;
	}

	if (node.type !== "ExpressionStatement") return false;
	const expression = getNode(node, "expression");
	if (!expression || expression.type !== "CallExpression") return false;
	return getNodeArray(expression, "arguments").some((arg) => getIdentifierName(arg) === name);
};

export const noPassThroughIntermediateVarsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow immediate alias variables that are returned or passed through unchanged in the next statement.",
		},
		messages: {
			passThrough:
				"Variable '{{name}}' is an immediate pass-through alias. Inline the original expression.",
		},
	},
	create(context) {
		return {
			BlockStatement(node) {
				const statements = getNodeArray(node, "body");
				for (let i = 0; i < statements.length - 1; i++) {
					const current = statements[i];
					const next = statements[i + 1];
					if (!current || !next || current.type !== "VariableDeclaration") continue;

					const declarators = getNodeArray(current, "declarations");
					if (declarators.length !== 1) continue;
					const declarator = declarators[0];
					if (!declarator) continue;
					const idName = getIdentifierName(declarator.id);
					const initNode = toNode(declarator.init);
					if (!idName || !initNode) continue;
					if (!usesIdentifierAsImmediateValue(next, idName)) continue;

					context.report({
						node: declarator,
						messageId: "passThrough",
						data: { name: idName },
					});
				}
			},
		};
	},
};
