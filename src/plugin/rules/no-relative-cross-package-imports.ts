import { existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import type { RuleModule } from "../types.js";
import { getLiteralString } from "../utils.js";

const findPackageJson = (dir: string): string | null => {
	const p = join(dir, "package.json");
	if (existsSync(p)) return p;
	const parent = dirname(dir);
	if (parent === dir) return null;
	return findPackageJson(parent);
};

export const noRelativeCrossPackageImportsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow relative imports that cross a package.json boundary.",
		},
		messages: {
			crossPackage:
				"Relative import '{{source}}' crosses a package boundary. Use a package alias or public entrypoint instead.",
		},
	},
	create(context) {
		const filename = context.filename;
		if (!filename) return {};

		return {
			ImportDeclaration(node) {
				const source = getLiteralString(node.source);
				if (!source || !source.startsWith("../")) return;

				const fileDir = dirname(filename);
				const resolvedTarget = resolve(fileDir, source);
				const resolvedTargetDir = dirname(resolvedTarget);

				const currentPackageJson = findPackageJson(fileDir);
				const targetPackageJson = findPackageJson(resolvedTargetDir);

				if (!currentPackageJson || !targetPackageJson) return;

				if (currentPackageJson !== targetPackageJson) {
					context.report({
						node,
						messageId: "crossPackage",
						data: { source },
					});
				}
			},
		};
	},
};
