import { dirname, resolve } from "node:path";
import type { RuleModule } from "../types.js";
import {
	getLiteralString,
	isTestFilename,
	getArchitecturalLayer,
	isLayerViolation,
} from "../utils.js";

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
				if (!source.startsWith("./") && !source.startsWith("../")) return;
				if (!filename) return;

				const resolvedPath = resolve(
					dirname(filename),
					source,
				);
				const toLayer = getArchitecturalLayer(resolvedPath);
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
