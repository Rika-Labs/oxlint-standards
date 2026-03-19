import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getNode,
	getNodeArray,
	isTestFilename,
} from "../utils.js";

const BANNED_NAMES = new Set([
	"processData",
	"handleResult",
	"util",
	"helper",
	"manager",
	"serviceHelper",
	"getData",
	"getResult",
	"handleRequest",
	"processInput",
	"doWork",
	"handleEvent",
]);

const GENERIC_PATTERN = /^(get|set|process|handle)(Data|Result|Input|Output|Info|Item|Value|Object)$/;

export const noLowSignalPublicNamesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow exported names that are too generic to convey meaning.",
		},
		messages: {
			lowSignal:
				"Exported name '{{name}}' is too generic. Use a domain-specific name.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			ExportNamedDeclaration(node) {
				const declaration = getNode(node, "declaration");
				if (!declaration) return;

				let name: string | null = null;

				if (declaration.type === "FunctionDeclaration") {
					name = getIdentifierName(declaration.id);
				} else if (declaration.type === "ClassDeclaration") {
					name = getIdentifierName(declaration.id);
				} else if (declaration.type === "VariableDeclaration") {
					const declarators = getNodeArray(declaration, "declarations");
					const first = declarators[0];
					if (first) {
						name = getIdentifierName(first.id);
					}
				}

				if (!name) return;
				if (!BANNED_NAMES.has(name) && !GENERIC_PATTERN.test(name)) return;

				context.report({
					node,
					messageId: "lowSignal",
					data: { name },
				});
			},
		};
	},
};
