import type { RuleModule } from "../types.js";
import { serializeAstForComparison, walkAst } from "../utils.js";
import { isDrizzleFile, isDrizzleIgnoredFile } from "./drizzle-utils.js";

const INFER_TYPE_PATTERN = /\$infer(?:Select|Insert)/;

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

					if (INFER_TYPE_PATTERN.test(serializeAstForComparison(declaration))) return;
					context.report({ node: candidate, messageId: "manualType" });
				});
			},
		};
	},
};
