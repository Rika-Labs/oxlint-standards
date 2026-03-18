import type { RuleModule } from "../types.js";
import {
	extractFunctionName,
	firstLowercaseToken,
	getNode,
	isFunctionValue,
	isTestFilename,
} from "../utils.js";

const BANNED_VAGUE_VERBS = new Set([
	"enhance",
	"normalize",
	"process",
	"handle",
	"manage",
	"transform",
	"execute",
	"perform",
	"do",
]);

export const noVagueVerbsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow vague leading verbs in function names to enforce mechanical naming.",
		},
		messages: {
			forbidden:
				"Function '{{name}}' starts with vague verb '{{verb}}'. Use a specific operation name.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		const checkName = (name: string | null, nodeForReport: Parameters<typeof context.report>[0]["node"]) => {
			if (!name || !nodeForReport) return;
			const verb = firstLowercaseToken(name);
			if (!verb || !BANNED_VAGUE_VERBS.has(verb)) return;
			context.report({
				node: nodeForReport,
				messageId: "forbidden",
				data: {
					name,
					verb,
				},
			});
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
