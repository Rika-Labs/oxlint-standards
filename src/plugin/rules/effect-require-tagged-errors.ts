import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, getNodeArray, isTestFilename, toNode } from "../utils.js";

const GENERIC_ERROR_CONSTRUCTORS = new Set([
	"Error",
	"TypeError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"URIError",
	"EvalError",
	"AggregateError",
]);

export const effectRequireTaggedErrorsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require Effect.fail to receive a tagged domain error rather than a plain value.",
		},
		messages: {
			untagged:
				"Effect.fail must receive a tagged domain error, not a plain value. Use a class extending Data.TaggedError or Schema.TaggedError.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				if (getIdentifierName(callee.object) !== "Effect") return;
				if (getMemberPropertyName(callee) !== "fail") return;

				const args = getNodeArray(node, "arguments");
				const arg = args[0];
				if (!arg) return;

				if (arg.type === "NewExpression") {
					const ctorName = getIdentifierName(arg.callee);
					if (ctorName && GENERIC_ERROR_CONSTRUCTORS.has(ctorName)) return;
					return;
				}

				if (arg.type === "CallExpression") {
					return;
				}

				if (
					arg.type === "Identifier" ||
					arg.type === "Literal" ||
					arg.type === "ObjectExpression"
				) {
					context.report({ node, messageId: "untagged" });
				}
			},
		};
	},
};
