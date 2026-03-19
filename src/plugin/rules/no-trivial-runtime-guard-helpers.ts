import type { AstNode, RuleModule } from "../types.js";
import {
	extractFunctionName,
	getFunctionStatements,
	getIdentifierName,
	getNode,
	isFunctionValue,
	toNode,
} from "../utils.js";

const BANNED_NAMES = new Set([
	"isString",
	"isNumber",
	"isBoolean",
	"isArray",
	"isObject",
	"isPlainObject",
]);

const TYPEOF_LITERALS = new Set([
	"string",
	"number",
	"boolean",
	"object",
	"undefined",
	"function",
	"bigint",
	"symbol",
]);

const isTypeofCheck = (node: AstNode | null): boolean => {
	if (!node || node.type !== "BinaryExpression") return false;
	if (!["===", "=="].includes(String(node.operator))) return false;

	const left = toNode(node.left);
	const right = toNode(node.right);
	if (!left || !right) return false;

	const unary = left.type === "UnaryExpression" ? left : right.type === "UnaryExpression" ? right : null;
	const literal = left.type === "Literal" ? left : right.type === "Literal" ? right : null;
	if (!unary || !literal) return false;
	if (unary.operator !== "typeof") return false;
	return typeof literal.value === "string" && TYPEOF_LITERALS.has(literal.value);
};

const isArrayCheck = (node: AstNode | null): boolean => {
	if (!node || node.type !== "CallExpression") return false;
	const callee = toNode(node.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	return getIdentifierName(callee.object) === "Array" && getIdentifierName(callee.property) === "isArray";
};

const isObjectNullCheck = (node: AstNode | null): boolean => {
	if (!node || node.type !== "BinaryExpression") return false;
	if (!["!==", "!="].includes(String(node.operator))) return false;
	const left = toNode(node.left);
	const right = toNode(node.right);
	return left?.type === "Literal" && left.value === null || right?.type === "Literal" && right.value === null;
};

const isPlainObjectCheck = (node: AstNode | null): boolean => {
	if (!node || node.type !== "LogicalExpression" || node.operator !== "&&") return false;
	const left = toNode(node.left);
	const right = toNode(node.right);
	if (isObjectNullCheck(left) && isTypeofCheck(right)) return true;
	if (isTypeofCheck(left) && isObjectNullCheck(right)) return true;
	return false;
};

const isTrivialRuntimeGuard = (node: AstNode): boolean => {
	const statements = getFunctionStatements(node);
	if (statements.length !== 1) return false;
	const statement = statements[0];
	if (!statement || statement.type !== "ReturnStatement") return false;
	const argument = getNode(statement, "argument");
	if (!argument) return false;
	return isTypeofCheck(argument) || isArrayCheck(argument) || isPlainObjectCheck(argument);
};

const getCalleeName = (node: AstNode): string | null => {
	const callee = toNode(node.callee);
	if (!callee) return null;
	if (callee.type === "Identifier") return callee.name as string;
	if (callee.type !== "MemberExpression") return null;
	return getIdentifierName(callee.property);
};

export const noTrivialRuntimeGuardHelpersRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow trivial runtime type-guard helpers that hide obvious inline checks or schema validation.",
		},
		messages: {
			helper:
				"Helper '{{name}}' is a trivial runtime guard. Inline the check or decode with schema validation.",
			call:
				"Call to '{{name}}' hides a trivial runtime guard. Inline the check or decode with schema validation.",
		},
	},
	create(context) {
		const checkFunctionLike = (node: AstNode): void => {
			const name = extractFunctionName(node);
			if (!name || !BANNED_NAMES.has(name) || !isTrivialRuntimeGuard(node)) return;
			context.report({
				node,
				messageId: "helper",
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
				checkFunctionLike(node);
			},
			CallExpression(node) {
				const name = getCalleeName(node);
				if (!name || !BANNED_NAMES.has(name)) return;
				context.report({
					node,
					messageId: "call",
					data: { name },
				});
			},
		};
	},
};
