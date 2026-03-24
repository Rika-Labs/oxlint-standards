import type { RuleModule } from "../types.js";
import { getIdentifierName, hasImportSource, isTestFilename, walkAst } from "../utils.js";

const STORE_DIR_PATTERN = /(?:^|\/)stores?(?:\/|$)/;

const ZUSTAND_IMPORT_PATTERN = /^zustand(?:\/|$)/;

export const zustandNoStoreOutsideStoreDirRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Zustand store creation (create()) outside of store directories.",
		},
		messages: {
			storeOutsideDir:
				"Zustand create() calls should only appear in store/ directories. Move store definitions to a dedicated store module.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename) return {};
		if (STORE_DIR_PATTERN.test(context.filename)) return {};

		return {
			Program(node) {
				if (!hasImportSource(node, (source) => ZUSTAND_IMPORT_PATTERN.test(source))) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					const calleeName = getIdentifierName(candidate.callee);
					if (calleeName === "create" || calleeName === "createStore") {
						context.report({ node: candidate, messageId: "storeOutsideDir" });
					}
				});
			},
		};
	},
};
