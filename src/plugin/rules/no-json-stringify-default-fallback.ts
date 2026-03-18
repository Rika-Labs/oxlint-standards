import type { AstNode, RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	getNode,
	getNodeArray,
	isDefaultFallbackNode,
	toNode,
	walkAst,
} from "../utils.js";

const isJsonStringifyCall = (candidate: AstNode): boolean => {
	if (candidate.type !== "CallExpression") return false;
	const callee = toNode(candidate.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	return getIdentifierName(callee.object) === "JSON" && getMemberPropertyName(callee) === "stringify";
};

const blockContainsJsonStringify = (node: AstNode | null): boolean => {
	if (!node) return false;
	let found = false;
	walkAst(node, (candidate) => {
		if (found) return;
		if (isJsonStringifyCall(candidate)) {
			found = true;
		}
	});
	return found;
};

const catchReturnsFallback = (handler: AstNode): boolean => {
	const catchBody = getNode(handler, "body");
	if (!catchBody || catchBody.type !== "BlockStatement") return false;

	const statements = getNodeArray(catchBody, "body");
	for (const statement of statements) {
		if (statement.type !== "ReturnStatement") continue;
		if (isDefaultFallbackNode(toNode(statement.argument))) return true;
	}

	return false;
};

export const noJsonStringifyDefaultFallbackRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow fallback defaults around JSON.stringify that silently mask serialization failures.",
		},
		messages: {
			forbidden:
				"JSON.stringify fallback default detected. Surface serialization failures instead of masking them.",
		},
	},
	create(context) {
		return {
			TryStatement(node) {
				const tryBlock = getNode(node, "block");
				const handler = getNode(node, "handler");
				if (!tryBlock || !handler) return;
				if (!blockContainsJsonStringify(tryBlock)) return;
				if (!catchReturnsFallback(handler)) return;

				context.report({ node, messageId: "forbidden" });
			},
			LogicalExpression(node) {
				if (node.operator !== "||" && node.operator !== "??") return;
				const left = toNode(node.left);
				if (!left || !isJsonStringifyCall(left)) return;
				if (!isDefaultFallbackNode(toNode(node.right))) return;
				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
