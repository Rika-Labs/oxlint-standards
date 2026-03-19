import { dirname, resolve } from "node:path";
import type { RuleModule } from "../types.js";
import {
	getLiteralString,
	isTestFilename,
	getArchitecturalLayer,
	isLayerViolation,
} from "../utils.js";

const isRelativeImport = (source: string): boolean =>
	source.startsWith("./") || source.startsWith("../");

const isAliasedImport = (source: string): boolean =>
	source.startsWith("@/") || source.startsWith("~/") || source.startsWith("#");

export const noCrossLayerImportsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow imports that violate the architectural layer dependency direction (ui -> app -> domain -> infra).",
		},
		messages: {
			crossLayer:
				"Import from '{{toLayer}}' layer violates dependency direction. '{{fromLayer}}' must not depend on '{{toLayer}}'.",
		},
	},
	create(context) {
		const filename = context.filename;
		if (isTestFilename(filename)) return {};

		const fromLayer = getArchitecturalLayer(filename);
		if (!fromLayer) return {};

		return {
			ImportDeclaration(node) {
				const source = getLiteralString(node.source);
				if (!source) return;

				let targetPath: string | null = null;

				if (isRelativeImport(source) && filename) {
					targetPath = resolve(dirname(filename), source);
				} else if (isAliasedImport(source)) {
					// For aliased imports like @/ui/Button, ~/domain/user, #infra/db
					// check the layer directly from the import path segments
					targetPath = source;
				}

				if (!targetPath) return;

				const toLayer = getArchitecturalLayer(targetPath);
				if (!toLayer) return;

				if (isLayerViolation(fromLayer, toLayer)) {
					context.report({
						node,
						messageId: "crossLayer",
						data: { fromLayer, toLayer },
					});
				}
			},
		};
	},
};
