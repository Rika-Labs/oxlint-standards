import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, isTestFilename, toNode, walkAst } from "../utils.js";
import { isEffectFile } from "./effect-utils.js";

export const effectNoMutableRefInGenRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow mutable let declarations inside Effect.gen blocks. Use Effect's Ref service for managed state.",
		},
		messages: {
			mutableInGen:
				"Do not use 'let {{name}}' inside Effect.gen. Use Effect.Ref for managed mutable state in generators.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			Program(node) {
				if (!isEffectFile(node, context.filename)) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;

					const callee = toNode(candidate.callee);
					if (!callee || callee.type !== "MemberExpression") return;

					const objectName = getIdentifierName(callee.object);
					const methodName = getMemberPropertyName(callee);
					if (objectName !== "Effect" || methodName !== "gen") return;

					const args = Array.isArray(candidate.arguments) ? candidate.arguments : [];
					for (const arg of args) {
						walkAst(arg, (inner) => {
							if (inner.type !== "VariableDeclaration") return;
							if (inner.kind !== "let") return;

							const declarations = Array.isArray(inner.declarations) ? inner.declarations : [];
							for (const decl of declarations) {
								const declNode = toNode(decl);
								if (!declNode) continue;
								const name = getIdentifierName(declNode.id) ?? "variable";
								context.report({
									node: inner,
									messageId: "mutableInGen",
									data: { name },
								});
							}
						});
					}
				});
			},
		};
	},
};
