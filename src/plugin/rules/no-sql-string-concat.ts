import type { RuleModule } from "../types.js";
import { getIdentifierName, getNodeArray, toNode } from "../utils.js";

const SQL_METHOD_NAMES = new Set(["query", "execute", "raw"]);
const SQL_KEYWORD_PATTERN = /^\s*(select|insert|update|delete|with)\b/i;

const hasSqlKeyword = (node: ReturnType<typeof toNode>): boolean => {
	if (!node) return false;
	if (node.type === "TemplateLiteral") {
		const expressions = Array.isArray(node.expressions) ? node.expressions : [];
		const quasis = Array.isArray(node.quasis) ? node.quasis : [];
		return expressions.length > 0 && quasis.some((quasi) =>
			SQL_KEYWORD_PATTERN.test(String((quasi as { value?: { cooked?: string } }).value?.cooked ?? "")));
	}
	return node.type === "Literal" && typeof node.value === "string" && SQL_KEYWORD_PATTERN.test(node.value);
};

const isSqlLikeArgument = (node: ReturnType<typeof toNode>): boolean => {
	if (!node) return false;
	if (node.type === "BinaryExpression") {
		return node.operator === "+" && (hasSqlKeyword(toNode(node.left)) || hasSqlKeyword(toNode(node.right)));
	}
	if (node.type === "TemplateLiteral") {
		return hasSqlKeyword(node);
	}
	return false;
};

export const noSqlStringConcatRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow SQL strings built with concatenation or untagged templates in database calls.",
		},
		messages: {
			sqlConcat:
				"Do not build SQL with concatenation or untagged templates. Use parameterized query APIs instead.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				const methodName = getIdentifierName(callee.property);
				if (!methodName || !SQL_METHOD_NAMES.has(methodName)) return;
				const firstArg = getNodeArray(node, "arguments")[0];
				if (!isSqlLikeArgument(firstArg ? toNode(firstArg) : null)) return;
				context.report({ node, messageId: "sqlConcat" });
			},
		};
	},
};
