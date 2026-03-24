import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	hasImportSource,
	isTestFilename,
	toNode,
	walkAst,
} from "../utils.js";

const COMPONENT_FILE_PATTERN = /(?:^|\/)(?:components|features|app|pages)(?:\/|$)/;

const ZUSTAND_IMPORT_PATTERN = /^zustand(?:\/|$)/;

export const zustandNoDirectSetInComponentsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow direct Zustand setState() calls in React components. Use named store actions instead.",
		},
		messages: {
			directSet:
				"Do not call setState() directly in component code. Define named actions in the store and call those instead.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename || !COMPONENT_FILE_PATTERN.test(context.filename)) return {};

		return {
			Program(node) {
				if (!hasImportSource(node, (source) => ZUSTAND_IMPORT_PATTERN.test(source))) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					const callee = toNode(candidate.callee);
					if (!callee || callee.type !== "MemberExpression") return;

					const methodName = getMemberPropertyName(callee);
					if (methodName !== "setState") return;

					const objectName = getIdentifierName(callee.object);
					if (objectName && /[Ss]tore/.test(objectName)) {
						context.report({ node: candidate, messageId: "directSet" });
					}
				});
			},
		};
	},
};
