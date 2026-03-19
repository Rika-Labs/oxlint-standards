import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	isTestFilename,
	toNode,
} from "../utils.js";

const ENTRYPOINT_FILE_PATTERN = /(?:^|\/)(?:main|index|cli|bin|server)\.[cm]?[jt]sx?$/;
const RUNNER_METHODS = new Set(["runPromise", "runSync"]);

export const effectPreferRunmainEntrypointRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Prefer NodeRuntime.runMain / BunRuntime.runMain / BrowserRuntime.runMain over Effect.runPromise and Effect.runSync in entrypoint files.",
		},
		messages: {
			preferRunMain:
				"Use NodeRuntime.runMain, BunRuntime.runMain, or BrowserRuntime.runMain instead of {{runner}} in entrypoints for graceful shutdown.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename || !ENTRYPOINT_FILE_PATTERN.test(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;

				const objectName = getIdentifierName(callee.object);
				if (objectName !== "Effect") return;

				const propertyName = getMemberPropertyName(callee);
				if (!propertyName || !RUNNER_METHODS.has(propertyName)) return;

				context.report({
					node,
					messageId: "preferRunMain",
					data: { runner: `Effect.${propertyName}` },
				});
			},
		};
	},
};
