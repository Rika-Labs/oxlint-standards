import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	isCompositionRootFile,
	isTestFilename,
	toNode,
} from "../utils.js";

const PROVIDE_METHODS = new Set(["provide", "provideService"]);

export const effectNoProvideInDomainRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Effect.provide and Effect.provideService outside composition roots and tests.",
		},
		messages: {
			forbidden:
				"Effect.provide is forbidden in domain logic. Provide dependencies at composition roots only.",
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
				if (objectName !== "Effect") return;

				const propertyName = getMemberPropertyName(callee);
				if (!propertyName || !PROVIDE_METHODS.has(propertyName)) return;

				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
