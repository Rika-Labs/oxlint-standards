import type { AstNode, RuleModule } from "../types.js";
import { getIdentifierName, getLiteralString, getMemberPropertyName, getNodeArray, toNode, walkAst } from "../utils.js";

const EFFECT_TRY_METHODS = new Set(["try", "tryPromise"]);

const collectThrowStatements = (root: AstNode): Set<AstNode> => {
	const throws = new Set<AstNode>();
	walkAst(root, (candidate) => {
		if (candidate.type === "ThrowStatement") {
			throws.add(candidate);
		}
	});
	return throws;
};

const collectSafeThrows = (root: AstNode): Set<AstNode> => {
	const safe = new Set<AstNode>();
	walkAst(root, (candidate) => {
		if (candidate.type !== "CallExpression") return;
		const callee = toNode(candidate.callee);
		if (!callee || callee.type !== "MemberExpression") return;
		if (getIdentifierName(callee.object) !== "Effect") return;
		const methodName = getMemberPropertyName(callee);
		if (!methodName || !EFFECT_TRY_METHODS.has(methodName)) return;

		const args = getNodeArray(candidate, "arguments");
		for (const arg of args) {
			walkAst(arg, (inner) => {
				if (inner.type === "ThrowStatement") {
					safe.add(inner);
				}
			});
		}
	});
	return safe;
};

export const effectNoThrowInServicesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow naked throw statements in Effect service code. Use Effect.try, Effect.tryPromise, or Effect.fail.",
		},
		messages: {
			throwInService:
				"Naked throw is forbidden in Effect service code. Use Effect.try, Effect.tryPromise, or return an Effect.fail.",
		},
	},
	create(context) {
		return {
			Program(node) {
				let isEffectFile = false;
				walkAst(node, (candidate) => {
					if (isEffectFile) return;
					if (candidate.type !== "ImportDeclaration") return;
					const source =
						getLiteralString(candidate.source) ??
						getIdentifierName(candidate.source);
					if (!source) return;
					if (source === "effect" || source.startsWith("@effect/")) {
						isEffectFile = true;
					}
				});

				if (!isEffectFile) return;

				const allThrows = collectThrowStatements(node);
				const safeThrows = collectSafeThrows(node);

				for (const throwNode of allThrows) {
					if (safeThrows.has(throwNode)) continue;
					context.report({ node: throwNode, messageId: "throwInService" });
				}
			},
		};
	},
};
