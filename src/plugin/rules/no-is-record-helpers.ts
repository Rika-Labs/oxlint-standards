import type { AstNode, RuleModule } from "../types.js";
import {
	extractFunctionName,
	getIdentifierName,
	getNode,
	getNodeArray,
	isFunctionValue,
	toNode,
} from "../utils.js";

const isRecordStringUnknownType = (node: AstNode | null): boolean => {
	if (!node || node.type !== "TSTypeReference") return false;
	if (getIdentifierName(node.typeName) !== "Record") return false;

	const typeParameters = toNode(node.typeParameters);
	if (!typeParameters) return false;
	const params = getNodeArray(typeParameters, "params");
	if (params.length !== 2) return false;

	const firstType = params[0];
	const secondType = params[1];
	if (!firstType || !secondType) return false;

	return firstType.type === "TSStringKeyword" && secondType.type === "TSUnknownKeyword";
};

const hasIsRecordName = (name: string | null): boolean => name === "isRecord";

const hasRecordPredicateReturn = (node: AstNode): boolean => {
	const returnType = toNode(node.returnType);
	if (!returnType || returnType.type !== "TSTypeAnnotation") return false;

	const annotation = toNode(returnType.typeAnnotation);
	if (!annotation || annotation.type !== "TSTypePredicate") return false;

	return isRecordStringUnknownType(toNode(annotation.typeAnnotation));
};

const isIsRecordCall = (node: AstNode): boolean => {
	if (node.type !== "CallExpression") return false;

	const callee = toNode(node.callee);
	if (!callee) return false;
	if (callee.type === "Identifier") return callee.name === "isRecord";
	if (callee.type !== "MemberExpression") return false;
	return getIdentifierName(callee.property) === "isRecord";
};

export const noIsRecordHelpersRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow isRecord-style helpers and Record<string, unknown> type predicates that hide domain intent.",
		},
		messages: {
			forbiddenName:
				"Do not define helpers named 'isRecord'. Use schema decode or domain-specific validators.",
			forbiddenPredicate:
				"Do not use 'value is Record<string, unknown>' predicates. Use explicit schema validation.",
			forbiddenCall: "Do not call isRecord-style helpers. Prefer explicit runtime schema decode.",
		},
	},
	create(context) {
		const checkFunctionLike = (node: AstNode): void => {
			const name = extractFunctionName(node);
			if (hasIsRecordName(name)) {
				context.report({ node, messageId: "forbiddenName" });
			}

			if (hasRecordPredicateReturn(node)) {
				context.report({ node, messageId: "forbiddenPredicate" });
			}
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
				if (hasRecordPredicateReturn(initNode)) {
					context.report({ node, messageId: "forbiddenPredicate" });
				}
			},
			CallExpression(node) {
				if (!isIsRecordCall(node)) return;
				context.report({ node, messageId: "forbiddenCall" });
			},
		};
	},
};
