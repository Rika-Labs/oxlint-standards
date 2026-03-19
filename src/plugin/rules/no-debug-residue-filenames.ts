import type { RuleModule } from "../types.js";

const DEBUG_FILENAME_PATTERN = /(?:^|\/)[^/]*(?:_old|_backup|temp|v2)[^/]*\.[^/]+$/i;

export const noDebugResidueFilenamesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow filenames that look like debug residue, backups, or throwaway revisions.",
		},
		messages: {
			debugResidue:
				"Filename '{{filename}}' looks like debug residue. Rename the file to its real intent.",
		},
	},
	create(context) {
		return {
			Program(node) {
				const filename = context.filename;
				if (!filename || !DEBUG_FILENAME_PATTERN.test(filename)) return;
				context.report({
					node,
					messageId: "debugResidue",
					data: { filename },
				});
			},
		};
	},
};
