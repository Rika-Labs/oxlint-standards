import type { RuleModule } from "../types.js";
import { serializeAstForComparison, walkAst } from "../utils.js";
import {
	collectNestedStarterCallSerializations,
	isDrizzleFile,
	isDrizzleIgnoredFile,
	isMethodCall,
} from "./drizzle-utils.js";

const UPDATE_METHODS = new Set(["update"]);
const WHERE_METHODS = new Set(["where"]);

export const drizzleEnforceUpdateWithWhereRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require .where() on Drizzle update() queries.",
		},
		messages: {
			missingWhere:
				"Drizzle update() calls must include .where() so mutations stay scoped.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				const safeUpdates = new Set<string>();
				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					if (!isMethodCall(candidate, WHERE_METHODS)) return;

					for (const serialization of collectNestedStarterCallSerializations(candidate, UPDATE_METHODS)) {
						safeUpdates.add(serialization);
					}
				});

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					if (!isMethodCall(candidate, UPDATE_METHODS)) return;

					if (safeUpdates.has(serializeAstForComparison(candidate))) return;
					context.report({ node: candidate, messageId: "missingWhere" });
				});
			},
		};
	},
};
