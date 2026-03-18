import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getLiteralString,
	getNode,
	getNodeArray,
	isTestFilename,
} from "../utils.js";

export const noImportThenReexportRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow importing symbols and re-exporting them later in the same file. Re-export directly.",
		},
		messages: {
			forbidden:
				"'{{name}}' is imported from '{{source}}' and re-exported later. Prefer direct re-export syntax.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		const importedLocalsBySource = new Map<string, string>();

		return {
			ImportDeclaration(node) {
				const source = getLiteralString(node.source);
				if (!source) return;
				const specifiers = getNodeArray(node, "specifiers");
				for (const specifier of specifiers) {
					const localNode = getNode(specifier, "local");
					const localName = getIdentifierName(localNode);
					if (!localName) continue;
					importedLocalsBySource.set(localName, source);
				}
			},
			ExportNamedDeclaration(node) {
				const sourceNode = getNode(node, "source");
				if (sourceNode) return;
				const specifiers = getNodeArray(node, "specifiers");
				for (const specifier of specifiers) {
					const localNode = getNode(specifier, "local");
					const exportedName = getIdentifierName(localNode);
					if (!exportedName) continue;
					const source = importedLocalsBySource.get(exportedName);
					if (!source) continue;
					context.report({
						node: specifier,
						messageId: "forbidden",
						data: {
							name: exportedName,
							source,
						},
					});
				}
			},
		};
	},
};
