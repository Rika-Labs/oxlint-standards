import type { RuleModule } from "../types.js";
import {
	getIdentifierName,
	getMemberPropertyName,
	hasImportSource,
	isTestFilename,
	toNode,
	walkAst,
} from "../utils.js";

const EFFECT_IMPORT_PATTERN = /^(?:effect|@effect\/)/;

const RUN_METHODS = new Set([
	"runPromise",
	"runSync",
	"runFork",
	"runCallback",
	"runPromiseExit",
	"runSyncExit",
]);

const COMPONENT_PATTERN = /\.(?:tsx|jsx)$/;

export const reactNoInlineEffectRunRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Effect runtime runners (runPromise, runSync, etc.) inside React component bodies. Use hooks for Effect lifecycle management.",
		},
		messages: {
			inlineRun:
				"Do not call {{method}} inside a React component body. Use a hook (useEffect, useCallback) with proper cleanup instead.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename || !COMPONENT_PATTERN.test(context.filename)) return {};

		return {
			Program(node) {
				if (!hasImportSource(node, (source) => EFFECT_IMPORT_PATTERN.test(source))) return;

				walkAst(node, (candidate) => {
					if (
						candidate.type !== "FunctionDeclaration" &&
						candidate.type !== "ArrowFunctionExpression" &&
						candidate.type !== "FunctionExpression"
					) return;

					const funcName = getIdentifierName(candidate.id);
					if (!funcName || !/^[A-Z]/.test(funcName)) return;

					walkAst(candidate, (inner) => {
						if (inner.type !== "CallExpression") return;
						const callee = toNode(inner.callee);
						if (!callee || callee.type !== "MemberExpression") return;

						const methodName = getMemberPropertyName(callee);
						if (!methodName || !RUN_METHODS.has(methodName)) return;

						context.report({
							node: inner,
							messageId: "inlineRun",
							data: { method: methodName },
						});
					});
				});
			},
		};
	},
};
