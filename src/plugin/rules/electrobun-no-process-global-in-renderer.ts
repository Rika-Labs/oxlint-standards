import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, isTestFilename, walkAst } from "../utils.js";

const RENDERER_FILE_PATTERN = /(?:^|\/)mainview(?:\/|$)/;

const PROCESS_METHODS = new Set([
	"exit",
	"kill",
	"abort",
	"chdir",
	"cwd",
	"umask",
]);

export const electrobunNoProcessGlobalInRendererRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow process globals (process.env, process.exit, etc.) in Electrobun renderer code.",
		},
		messages: {
			processInRenderer:
				"Do not use '{{access}}' in renderer code. Process globals are not available in the Electrobun renderer context.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename || !RENDERER_FILE_PATTERN.test(context.filename)) return {};

		return {
			Program(node) {
				walkAst(node, (candidate) => {
					if (candidate.type !== "MemberExpression") return;

					const objectName = getIdentifierName(candidate.object);
					if (objectName !== "process") return;

					const propertyName = getMemberPropertyName(candidate);
					if (!propertyName) return;

					if (propertyName === "env" || PROCESS_METHODS.has(propertyName)) {
						context.report({
							node: candidate,
							messageId: "processInRenderer",
							data: { access: `process.${propertyName}` },
						});
					}
				});
			},
		};
	},
};
