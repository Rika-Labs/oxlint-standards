import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	isCompositionRootFile,
	isTestFilename,
	toNode,
} from "../utils.js";

const LAYER_METHODS = new Set([
	"succeed",
	"effect",
	"scoped",
	"sync",
	"provide",
	"merge",
	"fresh",
	"suspend",
]);

export const effectNoLayerInLeafModulesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Layer construction in leaf modules. Layers should be created in composition roots or bootstrap files.",
		},
		messages: {
			forbidden:
				"Layer.{{method}} is forbidden in leaf modules. Create layers in composition root, bootstrap, or layers/ files.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (isCompositionRootFile(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;

				const objectName = getIdentifierName(callee.object);
				if (objectName !== "Layer") return;

				const propertyName = getMemberPropertyName(callee);
				if (!propertyName || !LAYER_METHODS.has(propertyName)) return;

				context.report({
					node,
					messageId: "forbidden",
					data: { method: propertyName },
				});
			},
		};
	},
};
