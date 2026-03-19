import type { RuleModule } from "../types.js";
import { getNode, getNodeArray, serializeAstForComparison } from "../utils.js";

export const noIdenticalBranchesRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow identical branches in if/else, ternaries, and switch statements.",
		},
		messages: {
			identicalBranches:
				"This branch is identical to another branch. Simplify or differentiate the logic.",
		},
	},
	create(context) {
		return {
			IfStatement(node) {
				const consequent = getNode(node, "consequent");
				const alternate = getNode(node, "alternate");
				if (!consequent || !alternate) return;

				const consequentSerialized = serializeAstForComparison(consequent);
				const alternateSerialized = serializeAstForComparison(alternate);
				if (
					consequentSerialized.length > 0 &&
					consequentSerialized === alternateSerialized
				) {
					context.report({ node, messageId: "identicalBranches" });
				}
			},

			ConditionalExpression(node) {
				const consequent = getNode(node, "consequent");
				const alternate = getNode(node, "alternate");
				if (!consequent || !alternate) return;

				const consequentSerialized = serializeAstForComparison(consequent);
				const alternateSerialized = serializeAstForComparison(alternate);
				if (
					consequentSerialized.length > 0 &&
					consequentSerialized === alternateSerialized
				) {
					context.report({ node, messageId: "identicalBranches" });
				}
			},

			SwitchStatement(node) {
				const cases = getNodeArray(node, "cases");
				if (cases.length < 2) return;

				const serializedCases: Array<{ index: number; serialized: string; caseNode: typeof cases[number] }> = [];

				for (let i = 0; i < cases.length; i++) {
					const caseNode = cases[i];
					if (!caseNode) continue;
					const consequentNodes = getNodeArray(caseNode, "consequent");
					const serialized = consequentNodes
						.map((stmt) => serializeAstForComparison(stmt))
						.join(";");
					serializedCases.push({ index: i, serialized, caseNode });
				}

				for (let i = 0; i < serializedCases.length; i++) {
					for (let j = i + 1; j < serializedCases.length; j++) {
						const a = serializedCases[i];
						const b = serializedCases[j];
						if (!a || !b) continue;
						if (
							a.serialized.length > 0 &&
							a.serialized === b.serialized
						) {
							context.report({
								node: b.caseNode,
								messageId: "identicalBranches",
							});
						}
					}
				}
			},
		};
	},
};
