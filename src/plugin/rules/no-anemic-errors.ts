import type { RuleModule } from "../types.js";
import { getIdentifierName, getLiteralString, getNode, getNodeArray, getString, isTestFilename } from "../utils.js";

const VAGUE_ERROR_PATTERN =
	/^(failed|error|something went wrong|an error occurred|unknown error|unexpected error|oops|failure|internal error|server error)$/i;

export const noAnemicErrorsRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow vague error messages in throw statements and generic error return objects.",
		},
		messages: {
			anemicThrow:
				"Error message '{{message}}' is too vague. Include context about what failed and why.",
			anemicReturn:
				"Returning a generic error object is forbidden. Use a typed domain error with context.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};

		return {
			ThrowStatement(node) {
				const argument = getNode(node, "argument");
				if (!argument || argument.type !== "NewExpression") return;

				const calleeName = getIdentifierName(argument.callee);
				if (calleeName !== "Error") return;

				const args = getNodeArray(argument, "arguments");
				const firstArg = args[0];
				if (!firstArg) return;

				const message = getLiteralString(firstArg);
				if (!message) return;
				if (!VAGUE_ERROR_PATTERN.test(message)) return;

				context.report({
					node,
					messageId: "anemicThrow",
					data: { message },
				});
			},
			ReturnStatement(node) {
				const returnVal = getNode(node, "argument");
				if (!returnVal || returnVal.type !== "ObjectExpression") return;

				const properties = getNodeArray(returnVal, "properties");
				let hasSuccessFalse = false;
				let hasVagueError = false;

				for (const prop of properties) {
					const keyName =
						getIdentifierName(prop.key) ?? getLiteralString(prop.key);
					if (!keyName) continue;

					if (keyName === "success") {
						const value = getNode(prop, "value");
						if (value && value.type === "Literal" && value.value === false) {
							hasSuccessFalse = true;
						}
					}

					if (keyName === "error") {
						const value = getNode(prop, "value");
						if (!value) continue;
						const errorStr = getString(value.value);
						if (errorStr && VAGUE_ERROR_PATTERN.test(errorStr)) {
							hasVagueError = true;
						}
					}
				}

				if (hasSuccessFalse && hasVagueError) {
					context.report({ node, messageId: "anemicReturn" });
				}
			},
		};
	},
};
