import type { AstNode, RuleModule } from "../types.js";
import { getIdentifierName, serializeAstForComparison, walkAst } from "../utils.js";
import { isDrizzleFile, isDrizzleIgnoredFile } from "./drizzle-utils.js";

const INFER_TYPE_PATTERN = /\$infer(?:Select|Insert)/;
const NON_MODEL_TYPE_SUFFIX_PATTERN =
	/(?:Args|Config|Filter|Filters|Input|Options|Output|Params|Payload|Query|Result)$/;

const getExportedTypeName = (declaration: AstNode): string | null => {
	if (declaration.type !== "TSInterfaceDeclaration" && declaration.type !== "TSTypeAliasDeclaration") {
		return null;
	}

	return getIdentifierName(declaration.id);
};

const shouldCheckModelTypeName = (name: string | null): boolean => {
	if (!name) return false;
	if (NON_MODEL_TYPE_SUFFIX_PATTERN.test(name)) return false;
	return /(?:^New[A-Z]|^[A-Z][A-Za-z0-9]+(?:Insert|Select)?$)/.test(name);
};

export const drizzleRequireInferTypesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require exported Drizzle model types to derive from $inferSelect/$inferInsert.",
		},
		messages: {
			manualType:
				"Exported Drizzle model types should derive from $inferSelect/$inferInsert instead of manual interfaces or aliases.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "ExportNamedDeclaration") return;
					const declaration = candidate.declaration;
					if (!declaration || typeof declaration !== "object") return;

					const declarationNode = declaration as { readonly type?: string };
					if (
						declarationNode.type !== "TSInterfaceDeclaration" &&
						declarationNode.type !== "TSTypeAliasDeclaration"
					) {
						return;
					}

					if (!shouldCheckModelTypeName(getExportedTypeName(declaration as AstNode))) return;
					if (INFER_TYPE_PATTERN.test(serializeAstForComparison(declaration))) return;
					context.report({ node: candidate, messageId: "manualType" });
				});
			},
		};
	},
};
