import type { RuleModule } from "../types.js";
import { getIdentifierName, getNode, getNodeArray, getLiteralString } from "../utils.js";

const DISCRIMINANT_NAMES = new Set(["_tag", "type", "kind"]);

export const noBagOfOptionalsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow exported types with many optional fields and no discriminant. Add a tag field or split into tagged variants.",
		},
		messages: {
			bagOfOptionals:
				"Exported type '{{name}}' has {{count}} optional fields without a discriminant. Add a '_tag', 'type', or 'kind' field, or split into tagged variants.",
		},
	},
	create(context) {
		return {
			ExportNamedDeclaration(node) {
				const declaration = getNode(node, "declaration");
				if (!declaration) return;

				let typeName: string | null = null;
				let members: ReadonlyArray<{ readonly type: string; readonly [key: string]: unknown }> = [];

				if (declaration.type === "TSTypeAliasDeclaration") {
					typeName = getIdentifierName(declaration.id);
					const typeAnnotation = getNode(declaration, "typeAnnotation");
					if (!typeAnnotation || typeAnnotation.type !== "TSTypeLiteral") return;
					members = getNodeArray(typeAnnotation, "members");
				} else if (declaration.type === "TSInterfaceDeclaration") {
					typeName = getIdentifierName(declaration.id);
					const body = getNode(declaration, "body");
					if (body) {
						members = getNodeArray(body, "body");
					}
				} else {
					return;
				}

				if (!typeName || members.length === 0) return;

				let optionalCount = 0;
				let hasDiscriminant = false;

				for (const member of members) {
					const keyName =
						getIdentifierName(member.key) ?? getLiteralString(member.key);
					if (!keyName) continue;

					if (member.optional === true) {
						optionalCount++;
					} else if (DISCRIMINANT_NAMES.has(keyName)) {
						hasDiscriminant = true;
					}
				}

				if (optionalCount >= 5 && !hasDiscriminant) {
					context.report({
						node,
						messageId: "bagOfOptionals",
						data: { name: typeName, count: String(optionalCount) },
					});
				}
			},
		};
	},
};
