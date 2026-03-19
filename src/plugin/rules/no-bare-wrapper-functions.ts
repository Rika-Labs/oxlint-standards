import type { AstNode, RuleModule } from "../types.js";
import {
	extractFunctionName,
	getFunctionParams,
	getFunctionStatements,
	getIdentifierName,
	getNode,
	isFunctionValue,
	toNode,
} from "../utils.js";

const isPassThroughReturn = (node: AstNode): boolean => {
	const params = getFunctionParams(node)
		.map((param) => getIdentifierName(param))
		.filter((param): param is string => param !== null);
	if (params.length === 0) return false;

	const statements = getFunctionStatements(node);
	if (statements.length !== 1) return false;
	const statement = statements[0];
	if (!statement || statement.type !== "ReturnStatement") return false;
	const argument = getNode(statement, "argument");
	if (!argument) return false;

	if (argument.type === "Identifier") {
		return params.length === 1 && argument.name === params[0];
	}

	if (argument.type !== "CallExpression") return false;
	const args = getNodeArray(argument, "arguments");
	if (args.length !== params.length) return false;
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const param = params[i];
		if (!arg || !param || getIdentifierName(arg) !== param) return false;
	}
	return true;
};

const getNodeArray = (node: AstNode, key: string): ReadonlyArray<AstNode> => {
	const value = node[key];
	if (!Array.isArray(value)) return [];
	return value.map((entry) => toNode(entry)).filter((entry): entry is AstNode => entry !== null);
};

export const noBareWrapperFunctionsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow wrapper functions that only pass arguments through to another function or identifier.",
		},
		messages: {
			wrapper:
				"Function '{{name}}' is a bare wrapper. Inline it or give it real behavior.",
		},
	},
	create(context) {
		const checkFunctionLike = (node: AstNode): void => {
			const name = extractFunctionName(node);
			if (!name || !isPassThroughReturn(node)) return;
			context.report({
				node,
				messageId: "wrapper",
				data: { name },
			});
		};

		return {
			FunctionDeclaration(node) {
				checkFunctionLike(node);
			},
			MethodDefinition(node) {
				checkFunctionLike(node);
			},
			VariableDeclarator(node) {
				const initNode = getNode(node, "init");
				if (!initNode || !isFunctionValue(initNode)) return;
				const name = getIdentifierName(node.id);
				if (!name || !isPassThroughReturn(initNode)) return;
				context.report({
					node,
					messageId: "wrapper",
					data: { name },
				});
			},
		};
	},
};
