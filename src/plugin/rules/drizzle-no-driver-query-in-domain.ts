import type { RuleModule } from "../types.js";
import { getIdentifierName, toNode, walkAst } from "../utils.js";
import { isDrizzleFile, isDrizzleIgnoredFile, isMethodCall } from "./drizzle-utils.js";

const QUERY_METHODS = new Set(["query"]);
const SUSPICIOUS_DRIVER_IDENTIFIERS = new Set([
	"postgres",
	"pg",
	"client",
	"pool",
	"connection",
	"dbClient",
	"postgresClient",
]);

export const drizzleNoDriverQueryInDomainRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Disallow direct driver query() calls in Drizzle domain code.",
		},
		messages: {
			driverQuery:
				"Use Drizzle repositories/query builders instead of direct driver query() calls in business logic.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					if (!isMethodCall(candidate, QUERY_METHODS)) return;

					const callee = toNode(candidate.callee);
					if (!callee || callee.type !== "MemberExpression") return;
					const objectName = getIdentifierName(callee.object);
					if (!objectName || !SUSPICIOUS_DRIVER_IDENTIFIERS.has(objectName)) return;

					context.report({ node: candidate, messageId: "driverQuery" });
				});
			},
		};
	},
};
