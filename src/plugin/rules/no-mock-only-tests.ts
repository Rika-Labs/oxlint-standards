import type { AstNode, RuleModule } from "../types.js";
import { getFunctionStatements, isTestFilename, toNode, toNodeArray, walkAst } from "../utils.js";

const TEST_NAMES = new Set(["it", "test"]);
const ASSERTION_NAMES = new Set(["expect", "assert"]);
const MOCK_METHOD_NAMES = new Set(["mock", "spyOn", "fn", "stub"]);

const getTestCallback = (node: AstNode): AstNode | null => {
	const args = toNodeArray(node.arguments);
	if (args.length < 2) return null;
	const callback = toNode(args[1]);
	if (!callback || (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression")) {
		return null;
	}
	return callback;
};

export const noMockOnlyTestsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require real assertions in tests instead of mock-only setup blocks.",
		},
		messages: {
			mockOnly:
				"Test contains mocks or spies but no real assertion. Add an assertion or remove the test.",
		},
	},
	create(context) {
		if (!isTestFilename(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "Identifier" || !TEST_NAMES.has(callee.name as string)) return;
				const callback = getTestCallback(node);
				if (!callback || getFunctionStatements(callback).length === 0) return;

				let hasAssertion = false;
				let hasMock = false;

				walkAst(callback, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					const callCallee = toNode(candidate.callee);
					if (!callCallee) return;

					if (callCallee.type === "Identifier" && ASSERTION_NAMES.has(callCallee.name as string)) {
						hasAssertion = true;
					}

					if (callCallee.type === "MemberExpression") {
						const objectName = toNode(callCallee.object)?.type === "Identifier"
							? (callCallee.object as { name?: string }).name
							: null;
						const propertyName = toNode(callCallee.property)?.type === "Identifier"
							? (callCallee.property as { name?: string }).name
							: null;
						if (ASSERTION_NAMES.has(String(objectName))) {
							hasAssertion = true;
						}
						if (
							(objectName === "jest" || objectName === "vi") &&
							MOCK_METHOD_NAMES.has(String(propertyName))
						) {
							hasMock = true;
						}
					}

					if (callCallee.type === "Identifier" && MOCK_METHOD_NAMES.has(callCallee.name as string)) {
						hasMock = true;
					}
				});

				if (hasMock && !hasAssertion) {
					context.report({ node, messageId: "mockOnly" });
				}
			},
		};
	},
};
