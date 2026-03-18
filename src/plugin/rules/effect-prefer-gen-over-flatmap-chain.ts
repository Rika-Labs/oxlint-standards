import type { AstNode, RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, getNode, getNodeArray, toNode } from "../utils.js";

const FLAT_MAP_CHAIN_LIMIT = 3;

const isFlatMapCall = (node: AstNode): boolean => {
	if (node.type !== "CallExpression") return false;
	const callee = toNode(node.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	return getMemberPropertyName(callee) === "flatMap";
};

const countFlatMapChain = (node: AstNode): number => {
	if (!isFlatMapCall(node)) return 0;
	const callee = toNode(node.callee);
	if (!callee) return 1;
	const previousCall = getNode(callee, "object");
	if (!previousCall) return 1;
	return 1 + countFlatMapChain(previousCall);
};

const isEffectFlatMapOperator = (node: AstNode): boolean => {
	if (node.type !== "CallExpression") return false;
	const callee = toNode(node.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	return getIdentifierName(callee.object) === "Effect" && getMemberPropertyName(callee) === "flatMap";
};

export const effectPreferGenOverFlatmapChainRule: RuleModule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Prefer Effect.gen for long flatMap chains.",
		},
		messages: {
			forbidden:
				"Use Effect.gen for 3+ sequential flatMap operations to keep control flow readable.",
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (isFlatMapCall(node) && countFlatMapChain(node) >= FLAT_MAP_CHAIN_LIMIT) {
					context.report({ node, messageId: "forbidden" });
					return;
				}

				const callee = toNode(node.callee);
				if (!callee || callee.type !== "MemberExpression") return;
				if (getMemberPropertyName(callee) !== "pipe") return;

				const args = getNodeArray(node, "arguments");
				let flatMapCount = 0;
				for (const arg of args) {
					if (!isEffectFlatMapOperator(arg)) continue;
					flatMapCount += 1;
				}

				if (flatMapCount < FLAT_MAP_CHAIN_LIMIT) return;
				context.report({ node, messageId: "forbidden" });
			},
		};
	},
};
