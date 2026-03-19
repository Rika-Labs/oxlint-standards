import type { RuleModule } from "../types.js";
import { isDomainFile, isTestFilename } from "../utils.js";

export const noDefaultExportInDomainRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow default exports in domain modules to enforce explicit named exports.",
		},
		messages: {
			forbidden:
				"Default exports are banned in domain modules. Use named exports.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!isDomainFile(context.filename)) return {};

		return {
			ExportDefaultDeclaration(node) {
				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
