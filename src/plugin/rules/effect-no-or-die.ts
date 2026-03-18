import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, isTestFilename, toNode } from "../utils.js";

export const effectNoOrDieRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow Effect.orDie in source code.",
		},
		messages: {
			forbidden:
				"Do not use Effect.orDie. Convert failures into typed errors and propagate them explicitly.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			MemberExpression(node) {
				const objectName = getIdentifierName(node.object);
				if (objectName !== "Effect") return;
				if (getMemberPropertyName(node) !== "orDie") return;
				context.report({ node, messageId: "forbidden" });
			},
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				const objectName = getIdentifierName(callee.object);
				if (objectName !== "Effect") return;
				if (getMemberPropertyName(callee) !== "orDie") return;
				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
