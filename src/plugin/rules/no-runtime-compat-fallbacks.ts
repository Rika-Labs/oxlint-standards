import type { AstNode, RuleModule } from "../types.js";
import { extractFunctionName, getIdentifierName, getLiteralString, getNode, toNode } from "../utils.js";

const COMPAT_TOKEN_PATTERN = /(polyfill|shim|legacy|compat|fallback|backward)/i;
const COMPAT_IMPORT_PATTERN = /(core-js|babel-polyfill|es5-shim|es6-shim|polyfill|shim|legacy)/i;

const hasCompatToken = (value: string | null): boolean =>
	typeof value === "string" && COMPAT_TOKEN_PATTERN.test(value);

export const noRuntimeCompatFallbacksRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow runtime compatibility and fallback shims in strict mode to keep runtime behavior explicit.",
		},
		messages: {
			import:
				"Compatibility import '{{source}}' is forbidden. Target current runtime behavior without shims.",
			name:
				"Identifier '{{name}}' signals compatibility fallback behavior. Remove fallback/compat shim logic.",
		},
	},
	create(context) {
		const reportCompatName = (name: string | null, node: AstNode): void => {
			if (!hasCompatToken(name)) return;
			context.report({
				node,
				messageId: "name",
				data: {
					name: name ?? "unknown",
				},
			});
		};

		return {
			ImportDeclaration(node) {
				const source = getLiteralString(node.source);
				if (!source || !COMPAT_IMPORT_PATTERN.test(source)) return;
				context.report({
					node,
					messageId: "import",
					data: {
						source,
					},
				});
			},
			FunctionDeclaration(node) {
				reportCompatName(extractFunctionName(node), node);
			},
			ClassDeclaration(node) {
				reportCompatName(getIdentifierName(node.id), node);
			},
			VariableDeclarator(node) {
				reportCompatName(getIdentifierName(node.id), node);
				const initNode = getNode(node, "init");
				if (!initNode || initNode.type !== "CallExpression") return;
				const callee = toNode(initNode.callee);
				if (!callee) return;
				if (callee.type === "Identifier") {
					reportCompatName(getIdentifierName(callee), node);
				}
			},
		};
	},
};
