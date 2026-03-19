import type { RuleModule } from "../types.js";
import { getIdentifierName, isTestFilename } from "../utils.js";

export const noStandaloneClassesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow standalone classes that do not extend anything in regular application code.",
		},
		messages: {
			standalone:
				"Class '{{name}}' does not extend anything. Prefer plain functions and objects unless inheritance is required.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			ClassDeclaration(node) {
				if (node.superClass) return;
				const name = getIdentifierName(node.id) ?? "AnonymousClass";
				context.report({
					node,
					messageId: "standalone",
					data: { name },
				});
			},
		};
	},
};
