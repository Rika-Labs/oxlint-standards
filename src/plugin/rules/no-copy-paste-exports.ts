import type { AstNode, RuleModule } from "../types.js";
import {
	getNode,
	getNodeArray,
	getIdentifierName,
	serializeAstForComparison,
	walkAst,
} from "../utils.js";

const normalizeIdentifiers = (serialized: string): string =>
	serialized.replace(/Identifier\|[^|]+/g, "Identifier|_");

const extractExportedFunctionBody = (
	exportNode: AstNode,
): { name: string; body: AstNode } | null => {
	const declaration = getNode(exportNode, "declaration");
	if (!declaration) return null;

	if (declaration.type === "FunctionDeclaration") {
		const name = getIdentifierName(declaration.id);
		const body = getNode(declaration, "body");
		if (name && body) return { name, body };
	}

	if (declaration.type === "VariableDeclaration") {
		const declarators = getNodeArray(declaration, "declarations");
		for (const declarator of declarators) {
			const name = getIdentifierName(declarator.id);
			const init = getNode(declarator, "init");
			if (!name || !init) continue;

			if (
				init.type === "ArrowFunctionExpression" ||
				init.type === "FunctionExpression"
			) {
				const body = getNode(init, "body");
				if (body) return { name, body };
			}
		}
	}

	return null;
};

export const noCopyPasteExportsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow exported functions with near-identical bodies that suggest copy-paste duplication.",
		},
		messages: {
			copyPaste:
				"Exported function '{{name}}' has a near-identical body to '{{other}}'. Extract shared logic into a reusable function.",
		},
	},
	create(context) {
		return {
			Program(node) {
				const exportedFunctions: Array<{
					name: string;
					normalized: string;
					exportNode: AstNode;
				}> = [];

				walkAst(node, (candidate) => {
					if (candidate.type !== "ExportNamedDeclaration") return;

					const result = extractExportedFunctionBody(candidate);
					if (!result) return;

					const serialized = serializeAstForComparison(result.body);
					if (serialized.length <= 50) return;

					const normalized = normalizeIdentifiers(serialized);
					exportedFunctions.push({
						name: result.name,
						normalized,
						exportNode: candidate,
					});
				});

				for (let i = 0; i < exportedFunctions.length; i++) {
					for (let j = i + 1; j < exportedFunctions.length; j++) {
						const a = exportedFunctions[i];
						const b = exportedFunctions[j];
						if (!a || !b) continue;
						if (a.normalized === b.normalized) {
							context.report({
								node: a.exportNode,
								messageId: "copyPaste",
								data: { name: a.name, other: b.name },
							});
							context.report({
								node: b.exportNode,
								messageId: "copyPaste",
								data: { name: b.name, other: a.name },
							});
						}
					}
				}
			},
		};
	},
};
