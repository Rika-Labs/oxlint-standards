import type { RuleModule } from "../types.js";
import { serializeAstForComparison, walkAst } from "../utils.js";
import {
	collectNestedStarterCallSerializations,
	isDrizzleFile,
	isDrizzleIgnoredFile,
	isMethodCall,
} from "./drizzle-utils.js";

const DELETE_METHODS = new Set(["delete"]);
const WHERE_METHODS = new Set(["where"]);

export const drizzleEnforceDeleteWithWhereRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require .where() on Drizzle delete() queries.",
		},
		messages: {
			missingWhere:
				"Drizzle delete() calls must include .where() so destructive queries stay scoped.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				const safeDeletes = new Set<string>();
				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					if (!isMethodCall(candidate, WHERE_METHODS)) return;

					for (const serialization of collectNestedStarterCallSerializations(candidate, DELETE_METHODS)) {
						safeDeletes.add(serialization);
					}
				});

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					if (!isMethodCall(candidate, DELETE_METHODS)) return;

					if (safeDeletes.has(serializeAstForComparison(candidate))) return;
					context.report({ node: candidate, messageId: "missingWhere" });
				});
			},
		};
	},
};
