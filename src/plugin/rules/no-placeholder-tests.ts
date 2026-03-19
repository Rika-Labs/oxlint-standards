import type { AstNode, RuleModule } from "../types.js";
import { getCommentText, getFunctionStatements, getNode, isTestFilename, toNode, toNodeArray } from "../utils.js";

const TEST_NAMES = new Set(["it", "test"]);
const PLACEHOLDER_PATTERN = /\b(todo|fixme|placeholder|implement.?later|mock.?data)\b/i;

const getTestBody = (node: AstNode): AstNode | null => {
	const args = toNodeArray(node.arguments);
	if (args.length < 2) return null;
	const callback = toNode(args[1]);
	if (!callback || (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression")) {
		return null;
	}
	return callback;
};

const hasOnlyPlaceholderText = (node: AstNode): boolean => {
	for (const statement of getFunctionStatements(node)) {
		if (statement.type === "ExpressionStatement") {
			const expression = getNode(statement, "expression");
			if (expression?.type === "Literal" && typeof expression.value === "string") {
				return PLACEHOLDER_PATTERN.test(expression.value);
			}
		}
	}

	const body = getNode(node, "body");
	if (!body) return false;
	return toNodeArray(body.comments).some((comment) => PLACEHOLDER_PATTERN.test(getCommentText(comment)));
};

export const noPlaceholderTestsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow empty or placeholder test bodies in test files.",
		},
		messages: {
			placeholder:
				"Test body is empty or placeholder-only. Write a real test or remove it.",
		},
	},
	create(context) {
		if (!isTestFilename(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "Identifier" || !TEST_NAMES.has(callee.name as string)) return;
				const testBody = getTestBody(node);
				if (!testBody) return;
				if (getFunctionStatements(testBody).length === 0 || hasOnlyPlaceholderText(testBody)) {
					context.report({ node, messageId: "placeholder" });
				}
			},
		};
	},
};
