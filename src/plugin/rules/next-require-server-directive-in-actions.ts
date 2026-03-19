import type { AstNode, RuleModule } from "../types.js";
import {
	getFilenameBase,
	getIdentifierName,
	getNodeArray,
	hasProgramDirective,
	isAppRouterFile,
	isFixtureOrDocsFile,
	isTestFilename,
	toNode,
} from "../utils.js";

const ACTION_FILE_PATTERN = /^actions?\.[cm]?[jt]sx?$/;

const isAsyncFunctionNode = (value: unknown): boolean => {
	const node = toNode(value);
	if (!node) return false;
	return (
		(node.type === "ArrowFunctionExpression" ||
			node.type === "FunctionExpression" ||
			node.type === "FunctionDeclaration") &&
		node.async === true
	);
};

const isExportedAsyncAction = (node: AstNode): boolean => {
	if (node.type !== "ExportNamedDeclaration") return false;
	const declaration = toNode(node.declaration);
	if (!declaration) return false;

	if (declaration.type === "FunctionDeclaration") {
		const functionName = getIdentifierName(declaration.id) ?? "";
		return declaration.async === true && functionName.endsWith("Action");
	}

	if (declaration.type !== "VariableDeclaration") return false;
	for (const declarator of getNodeArray(declaration, "declarations")) {
		const init = toNode(declarator.init);
		const name = getIdentifierName(declarator.id) ?? "";
		if (name.endsWith("Action") && isAsyncFunctionNode(init)) {
			return true;
		}
	}

	return false;
};

const hasExportedAsyncFunction = (node: AstNode): boolean => {
	for (const statement of getNodeArray(node, "body")) {
		if (statement.type !== "ExportNamedDeclaration") continue;
		const declaration = toNode(statement.declaration);
		if (!declaration) continue;

		if (isAsyncFunctionNode(declaration)) return true;
		if (declaration.type !== "VariableDeclaration") continue;
		for (const declarator of getNodeArray(declaration, "declarations")) {
			if (isAsyncFunctionNode(declarator.init)) return true;
		}
	}

	return false;
};

export const nextRequireServerDirectiveInActionsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require 'use server' in App Router action modules.",
		},
		messages: {
			missingDirective:
				"Server action modules should declare 'use server' at the top level.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename) || isFixtureOrDocsFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isAppRouterFile(context.filename)) return;
				if (hasProgramDirective(node, "use server")) return;

				const filenameBase = getFilenameBase(context.filename);
				const looksLikeActionFile =
					(filenameBase !== null && ACTION_FILE_PATTERN.test(filenameBase)) ||
					getNodeArray(node, "body").some((statement) => isExportedAsyncAction(statement));
				if (!looksLikeActionFile) return;
				if (!hasExportedAsyncFunction(node)) return;

				context.report({ node, messageId: "missingDirective" });
			},
		};
	},
};
