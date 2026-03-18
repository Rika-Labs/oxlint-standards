import type { RuleModule } from "../types.js";
import { extractFunctionName, getNode, isFunctionValue, splitWords } from "../utils.js";

export const noDuplicateContextRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow duplicate adjacent context words in function names.",
		},
		messages: {
			duplicate:
				"Function '{{name}}' repeats '{{word}}'. Remove duplicate context from the identifier.",
		},
	},
	create(context) {
		const checkName = (name: string | null, nodeForReport: Parameters<typeof context.report>[0]["node"]) => {
			if (!name || !nodeForReport) return;
			const words = splitWords(name);
			for (let index = 1; index < words.length; index += 1) {
				const previous = words[index - 1];
				const current = words[index];
				if (!previous || !current) continue;
				if (previous !== current) continue;
				context.report({
					node: nodeForReport,
					messageId: "duplicate",
					data: {
						name,
						word: current,
					},
				});
				return;
			}
		};

		return {
			FunctionDeclaration(node) {
				checkName(extractFunctionName(node), node);
			},
			MethodDefinition(node) {
				checkName(extractFunctionName(node), node);
			},
			VariableDeclarator(node) {
				const initNode = getNode(node, "init");
				if (!initNode || !isFunctionValue(initNode)) return;
				checkName(extractFunctionName(node), node);
			},
		};
	},
};
