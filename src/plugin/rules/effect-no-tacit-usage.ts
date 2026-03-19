import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	getNodeArray,
	toNode,
} from "../utils.js";

const PIPE_METHODS = new Set(["map", "flatMap", "tap"]);

export const effectNoTacitUsageRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow tacit (point-free) usage with Effect combinators and flow.",
		},
		messages: {
			tacitEffect:
				"Avoid tacit (point-free) usage of {{method}}. Use an explicit arrow function for clarity.",
			tacitFlow:
				"Avoid flow() in Effect-heavy modules. Use explicit arrow functions or Effect.gen for clarity.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee) return;

				if (callee.type === "MemberExpression") {
					const objectName = getIdentifierName(callee.object);
					if (objectName !== "Effect") return;

					const propertyName = getMemberPropertyName(callee);
					if (!propertyName || !PIPE_METHODS.has(propertyName)) return;

					const args = getNodeArray(node, "arguments");
					const arg = args[0];
					if (!arg) return;

					if (arg.type === "Identifier") {
						context.report({
							node,
							messageId: "tacitEffect",
							data: { method: `Effect.${propertyName}` },
						});
					}
					return;
				}

				if (callee.type === "Identifier") {
					const name = getIdentifierName(callee);
					if (name !== "flow") return;

					context.report({
						node,
						messageId: "tacitFlow",
					});
				}
			},
		};
	},
};
