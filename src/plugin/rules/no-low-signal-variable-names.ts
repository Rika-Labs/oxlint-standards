import type { AstNode, RuleModule } from "../types.js";
import { getFunctionParams, getIdentifierName, getNode, getNodeArray, isFunctionValue, isTestFilename } from "../utils.js";

const BANNED_NAMES = new Set(["data", "item", "result", "value", "obj"]);

const reportIfBanned = (context: Parameters<RuleModule["create"]>[0], node: AstNode, name: string | null): void => {
	if (!name || !BANNED_NAMES.has(name)) return;
	context.report({
		node,
		messageId: "lowSignal",
		data: { name },
	});
};

export const noLowSignalVariableNamesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow top-level locals and named function parameters with low-signal names.",
		},
		messages: {
			lowSignal:
				"Name '{{name}}' is too generic. Use a name that carries domain meaning.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			Program(node) {
				for (const statement of getNodeArray(node, "body")) {
					if (statement.type === "VariableDeclaration") {
						for (const declarator of getNodeArray(statement, "declarations")) {
							reportIfBanned(context, declarator, getIdentifierName(declarator.id));
						}
					}

					if (statement.type === "FunctionDeclaration") {
						for (const param of getFunctionParams(statement)) {
							reportIfBanned(context, param, getIdentifierName(param));
						}
					}

					if (statement.type === "ExportNamedDeclaration") {
						const declaration = getNode(statement, "declaration");
						if (!declaration) continue;

						if (declaration.type === "VariableDeclaration") {
							for (const declarator of getNodeArray(declaration, "declarations")) {
								reportIfBanned(context, declarator, getIdentifierName(declarator.id));
							}
						}

						if (declaration.type === "FunctionDeclaration") {
							for (const param of getFunctionParams(declaration)) {
								reportIfBanned(context, param, getIdentifierName(param));
							}
						}
					}
				}
			},
			VariableDeclarator(node) {
				const initNode = getNode(node, "init");
				if (!initNode || !isFunctionValue(initNode)) return;
				for (const param of getFunctionParams(initNode)) {
					reportIfBanned(context, param, getIdentifierName(param));
				}
			},
		};
	},
};
