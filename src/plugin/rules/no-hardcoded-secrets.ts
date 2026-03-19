import type { RuleModule } from "../types.js";
import { getIdentifierName, getLiteralString, getNode } from "../utils.js";

const SECRET_NAME_PATTERN = /(token|secret|password|apiKey|clientSecret)/i;

const hasSecretName = (value: string | null): boolean =>
	typeof value === "string" && SECRET_NAME_PATTERN.test(value);

export const noHardcodedSecretsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow hardcoded secrets in variables or object properties with secret-like names.",
		},
		messages: {
			secret:
				"Hardcoded secret '{{name}}' detected. Load it from configuration instead of committing a literal.",
		},
	},
	create(context) {
		return {
			VariableDeclarator(node) {
				const name = getIdentifierName(node.id);
				const value = getLiteralString(node.init);
				if (!hasSecretName(name) || !value) return;
				context.report({
					node,
					messageId: "secret",
					data: { name: name ?? "secret" },
				});
			},
			Property(node) {
				const keyName = getIdentifierName(node.key) ?? getLiteralString(node.key);
				const value = getLiteralString(getNode(node, "value"));
				if (!hasSecretName(keyName) || !value) return;
				context.report({
					node,
					messageId: "secret",
					data: { name: keyName ?? "secret" },
				});
			},
		};
	},
};
