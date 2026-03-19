import type { AstNode, RuleModule } from "../types.js";
import {
	getNode,
	getNodeArray,
	getProgramBody,
	isFunctionValue,
	serializeAstForComparison,
	walkAst,
} from "../utils.js";
import {
	collectTransactionScopedWriteSerializations,
	countWriteCalls,
	isMethodCall,
	DRIZZLE_WRITE_METHODS,
	isDrizzleFile,
	isDrizzleIgnoredFile,
} from "./drizzle-utils.js";

const getFunctionBody = (node: AstNode): AstNode | null => {
	if (node.type === "FunctionDeclaration" || isFunctionValue(node)) {
		return getNode(node, "body");
	}

	return null;
};

const getTopLevelFunctionNodes = (program: AstNode): ReadonlyArray<AstNode> => {
	const functions: Array<AstNode> = [];

	for (const statement of getProgramBody(program)) {
		if (statement.type === "FunctionDeclaration") {
			functions.push(statement);
			continue;
		}

		const declaration =
			statement.type === "ExportNamedDeclaration" ? getNode(statement, "declaration") : statement;
		if (!declaration || declaration.type !== "VariableDeclaration") continue;

		for (const declarator of getNodeArray(declaration, "declarations")) {
			const init = getNode(declarator, "init");
			if (!init || !isFunctionValue(init)) continue;
			functions.push(init);
		}
	}

	return functions;
};

export const drizzleRequireTransactionScopeRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description: "Require transactions around functions that perform multiple Drizzle writes.",
		},
		messages: {
			missingTransaction:
				"Wrap multi-statement Drizzle write operations in db.transaction(...) or SqlClient.withTransaction.",
		},
	},
	create(context) {
		if (isDrizzleIgnoredFile(context.filename)) return {};

		return {
			Program(node) {
				if (!isDrizzleFile(node, context.filename)) return;

				for (const candidate of getTopLevelFunctionNodes(node)) {
					const body = getFunctionBody(candidate);
					if (!body) continue;

					const totalWrites = countWriteCalls(body);
					if (totalWrites < 2) continue;

					const safeWrites = collectTransactionScopedWriteSerializations(body);
					let unsafeWrites = 0;
					walkAst(body, (inner) => {
						if (inner.type !== "CallExpression") return;
						if (!isMethodCall(inner, DRIZZLE_WRITE_METHODS)) return;
						const serialization = serializeAstForComparison(inner);
						if (safeWrites.has(serialization)) return;
						unsafeWrites += 1;
					});

					if (unsafeWrites === 0) continue;

					context.report({ node: candidate, messageId: "missingTransaction" });
				}
			},
		};
	},
};
