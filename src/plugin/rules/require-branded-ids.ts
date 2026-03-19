import type { RuleModule } from "../types.js";
import { getIdentifierName, getNode, getString, walkAst } from "../utils.js";

export const requireBrandedIdsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require exported type aliases ending in 'Id' to be branded types.",
		},
		messages: {
			unbrandedId:
				"Type '{{name}}' ends with 'Id' but is not branded. Use Brand.Brand, Opaque, or an intersection with a brand field.",
		},
	},
	create(context) {
		return {
			ExportNamedDeclaration(node) {
				const declaration = getNode(node, "declaration");
				if (!declaration || declaration.type !== "TSTypeAliasDeclaration") return;

				const name = getIdentifierName(declaration.id);
				if (!name || !name.endsWith("Id")) return;

				const typeAnnotation = getNode(declaration, "typeAnnotation");
				if (!typeAnnotation) return;

				let hasBranding = false;
				walkAst(typeAnnotation, (candidate) => {
					if (hasBranding) return;

					if (candidate.type === "TSIntersectionType") {
						walkAst(candidate, (inner) => {
							if (hasBranding) return;
							const keyName =
								getIdentifierName(inner.key) ?? getString(inner.key as unknown as string);
							if (keyName === "_brand" || keyName === "_tag") {
								hasBranding = true;
							}
						});
					}

					if (candidate.type === "TSTypeReference") {
						const typeName = getNode(candidate, "typeName");
						if (typeName) {
							const refName = getIdentifierName(typeName);
							if (refName && (refName.includes("Brand") || refName.includes("Branded"))) {
								hasBranding = true;
							}
							if (typeName.type === "TSQualifiedName") {
								const right = getIdentifierName(typeName.right);
								if (right && (right.includes("Brand") || right.includes("Branded"))) {
									hasBranding = true;
								}
							}
						}
					}
				});

				if (!hasBranding) {
					context.report({
						node,
						messageId: "unbrandedId",
						data: { name },
					});
				}
			},
		};
	},
};
