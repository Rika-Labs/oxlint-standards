import type { RuleModule } from "../types.js";
import { getIdentifierName, getNode } from "../utils.js";

export const noAsNeverRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow casting expressions to never.",
		},
		messages: {
			forbidden: "Do not cast to 'never'. Fix the type boundary instead.",
		},
	},
	create(context) {
		return {
			TSAsExpression(node) {
				const annotation = getNode(node, "typeAnnotation");
				if (!annotation) return;
				if (annotation.type === "TSNeverKeyword") {
					context.report({ node, messageId: "forbidden" });
					return;
				}
				if (annotation.type !== "TSTypeReference") return;
				const typeName = getNode(annotation, "typeName");
				if (getIdentifierName(typeName) !== "never") return;
				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
