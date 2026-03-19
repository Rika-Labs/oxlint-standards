import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	isTestFilename,
	toNode,
} from "../utils.js";

const TERMINAL_RUNNERS = new Set([
	"runPromise",
	"runPromiseExit",
	"runSync",
	"runSyncExit",
	"runFork",
	"runCallback",
	"unsafeRunPromise",
	"unsafeRunSync",
	"unwrap",
]);
const ENTRYPOINT_FILE_PATTERNS = [
	/(?:^|\/)(?:main|cli)\.[cm]?[jt]sx?$/,
	/(?:^|\/)bin\/[^/]+\.[cm]?[jt]sx?$/,
];

const isEntrypointFile = (filename: string | undefined): boolean =>
	typeof filename === "string" && ENTRYPOINT_FILE_PATTERNS.some((pattern) => pattern.test(filename));

export const effectNoTerminalRunnersRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow terminal Effect/Runtime runners outside entrypoint-like files.",
		},
		messages: {
			forbidden:
				"Do not execute effects with {{runner}} in library code. Return Effect values and run them at app boundaries.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (isEntrypointFile(context.filename)) return {};

		return {
			CallExpression(node) {
				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;

				const objectName = getIdentifierName(callee.object);
				if (!objectName || (objectName !== "Effect" && objectName !== "Runtime")) return;

				const propertyName = getMemberPropertyName(callee);
				if (!propertyName || !TERMINAL_RUNNERS.has(propertyName)) return;

				context.report({
					node,
					messageId: "forbidden",
					data: {
						runner: `${objectName}.${propertyName}`,
					},
				});
			},
		};
	},
};
