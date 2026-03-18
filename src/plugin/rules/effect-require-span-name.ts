import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getLiteralString,
	getMemberPropertyName,
	getNodeArray,
	toNode,
} from "../utils.js";

const EFFECT_FN_SPAN_PATTERN = /^[A-Z][A-Za-z0-9]*\.[a-z][A-Za-z0-9]*$/;
const WITH_SPAN_PATTERN = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*){1,}$/;

export const effectRequireSpanNameRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require consistent span naming in Effect.fn and Effect.withSpan calls.",
		},
		messages: {
			effectFn:
				"Effect.fn span name must match 'ClassName.methodName' (example: 'UserService.create').",
			withSpan:
				"Effect.withSpan name must be dot-separated lowercase segments (example: 'payments.service.charge').",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				if (getIdentifierName(callee.object) !== "Effect") return;

				const methodName = getMemberPropertyName(callee);
				if (methodName !== "fn" && methodName !== "withSpan") return;

				const firstArgument = getNodeArray(node, "arguments")[0];
				const spanName = getLiteralString(firstArgument);

				if (!spanName) {
					context.report({
						node,
						messageId: methodName === "fn" ? "effectFn" : "withSpan",
					});
					return;
				}

				if (methodName === "fn" && !EFFECT_FN_SPAN_PATTERN.test(spanName)) {
					context.report({ node, messageId: "effectFn" });
					return;
				}

				if (methodName === "withSpan" && !WITH_SPAN_PATTERN.test(spanName)) {
					context.report({ node, messageId: "withSpan" });
				}
			},
		};
	},
};
