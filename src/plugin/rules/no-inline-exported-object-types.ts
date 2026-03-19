import type { RuleModule } from "../types.js";
import { getNode, getNodeArray, walkAst } from "../utils.js";

export const noInlineExportedObjectTypesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow large inline object types in exported function signatures. Extract to a named type or interface.",
		},
		messages: {
			inlineObjectType:
				"Inline object type with {{count}} properties is too large for an exported API. Extract to a named type or interface.",
		},
	},
	create(context) {
		return {
			ExportNamedDeclaration(node) {
				const declaration = getNode(node, "declaration");
				if (!declaration) return;

				walkAst(declaration, (candidate) => {
					if (candidate.type !== "TSTypeLiteral") return;
					const members = getNodeArray(candidate, "members");
					if (members.length < 4) return;
					context.report({
						node,
						messageId: "inlineObjectType",
						data: { count: String(members.length) },
					});
				});
			},
		};
	},
};
