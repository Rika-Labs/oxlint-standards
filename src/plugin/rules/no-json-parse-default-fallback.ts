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

const isJsonParseCall = (candidate: AstNode): boolean => {
	if (candidate.type !== "CallExpression") return false;
	const callee = toNode(candidate.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	return getIdentifierName(callee.object) === "JSON" && getMemberPropertyName(callee) === "parse";
};

const blockContainsJsonParse = (node: AstNode | null): boolean => {
	if (!node) return false;
	let found = false;
	walkAst(node, (candidate) => {
		if (found) return;
		if (isJsonParseCall(candidate)) {
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
		const argumentNode = toNode(statement.argument);
		if (isDefaultFallbackNode(argumentNode)) return true;
	}

	return false;
};

export const noJsonParseDefaultFallbackRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow fallback defaults around JSON.parse that hide malformed payloads and schema violations.",
		},
		messages: {
			forbidden:
				"JSON.parse fallback default detected. Decode with explicit schema validation and fail fast on invalid input.",
		},
	},
	create(context) {
		return {
			TryStatement(node) {
				const tryBlock = getNode(node, "block");
				const handler = getNode(node, "handler");
				if (!tryBlock || !handler) return;
				if (!blockContainsJsonParse(tryBlock)) return;
				if (!catchReturnsFallback(handler)) return;

				context.report({ node, messageId: "forbidden" });
			},
			LogicalExpression(node) {
				if (node.operator !== "||" && node.operator !== "??") return;
				const left = toNode(node.left);
				if (!left || !isJsonParseCall(left)) return;
				if (!isDefaultFallbackNode(toNode(node.right))) return;
				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
