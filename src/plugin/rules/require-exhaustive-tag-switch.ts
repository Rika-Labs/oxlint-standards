import type { AstNode, RuleModule } from "../types.js";
import { getNode, getNodeArray, getMemberPropertyName, walkAst } from "../utils.js";

const TAG_PROPERTIES = new Set(["_tag", "type", "kind"]);

export const requireExhaustiveTagSwitchRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require switch statements on tagged union discriminants to be exhaustive via a default case that throws.",
		},
		messages: {
			nonExhaustive:
				"Switch on '{{property}}' must be exhaustive. Add a default case that throws to catch unhandled variants.",
		},
	},
	create(context) {
		return {
			SwitchStatement(node) {
				const discriminant = getNode(node, "discriminant");
				if (!discriminant) return;

				const property = getMemberPropertyName(discriminant);
				if (!property || !TAG_PROPERTIES.has(property)) return;

				const cases = getNodeArray(node, "cases");

				let defaultCase: AstNode | null = null;
				for (const caseNode of cases) {
					const test = getNode(caseNode, "test");
					if (test === null) {
						defaultCase = caseNode;
						break;
					}
				}

				if (!defaultCase) {
					context.report({
						node,
						messageId: "nonExhaustive",
						data: { property },
					});
					return;
				}

				const consequent = getNodeArray(defaultCase, "consequent");
				let hasThrow = false;
				for (const stmt of consequent) {
					walkAst(stmt, (candidate) => {
						if (candidate.type === "ThrowStatement") {
							hasThrow = true;
						}
					});
					if (hasThrow) break;
				}

				if (!hasThrow) {
					context.report({
						node,
						messageId: "nonExhaustive",
						data: { property },
					});
				}
			},
		};
	},
};
