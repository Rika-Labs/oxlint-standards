import type { RuleModule } from "../types.js";
import { getProgramBody, hasProgramDirective, isAppRouterRootFile } from "../utils.js";

export const nextNoUseClientInRootFilesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow 'use client' in App Router root page/layout files.",
		},
		messages: {
			useClientRoot:
				"Keep App Router root files server-first. Move client behavior into nested client components instead of adding 'use client' here.",
		},
	},
	create(context) {
		return {
			Program(node) {
				if (!isAppRouterRootFile(context.filename)) return;
				if (!hasProgramDirective(node, "use client")) return;

				const [firstStatement] = getProgramBody(node);
				context.report({ node: firstStatement ?? node, messageId: "useClientRoot" });
			},
		};
	},
};
