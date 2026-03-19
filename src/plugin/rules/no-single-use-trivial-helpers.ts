import type { AstNode, RuleModule } from "../types.js";
import {
	extractFunctionName,
	getFunctionStatements,
	getIdentifierName,
	getNode,
	getNodeArray,
	isFunctionValue,
	toNode,
	walkAst,
} from "../utils.js";

type FunctionDefinition = {
	readonly name: string;
	readonly node: AstNode;
};

const getTopLevelDefinitions = (program: AstNode): ReadonlyArray<FunctionDefinition> => {
	const definitions: FunctionDefinition[] = [];

	for (const statement of getNodeArray(program, "body")) {
		if (statement.type === "ExportNamedDeclaration") continue;

		if (statement.type === "FunctionDeclaration") {
			const name = extractFunctionName(statement);
			if (name) {
				definitions.push({ name, node: statement });
			}
			continue;
		}

		if (statement.type !== "VariableDeclaration") continue;
		for (const declarator of getNodeArray(statement, "declarations")) {
			const initNode = getNode(declarator, "init");
			if (!initNode || !isFunctionValue(initNode)) continue;
			const name = getIdentifierName(declarator.id);
			if (!name) continue;
			definitions.push({ name, node: declarator });
		}
	}

	return definitions;
};

const getStatementCount = (node: AstNode): number => {
	const statements = getFunctionStatements(node);
	if (statements.length > 0) return statements.length;
	const body = getNode(node, "body");
	return body ? 1 : 0;
};

export const noSingleUseTrivialHelpersRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow tiny file-local helpers that are used exactly once and only add indirection.",
		},
		messages: {
			singleUse:
				"Helper '{{name}}' is tiny and used once. Inline it instead of adding another hop.",
		},
	},
	create(context) {
		return {
			Program(node) {
				const definitions = getTopLevelDefinitions(node);
				if (definitions.length === 0) return;

				const callCounts = new Map<string, number>();
				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					const callee = toNode(candidate.callee);
					if (!callee || callee.type !== "Identifier") return;
					callCounts.set(callee.name as string, (callCounts.get(callee.name as string) ?? 0) + 1);
				});

				for (const definition of definitions) {
					if (getStatementCount(definition.node) > 3) continue;
					if ((callCounts.get(definition.name) ?? 0) !== 1) continue;
					context.report({
						node: definition.node,
						messageId: "singleUse",
						data: { name: definition.name },
					});
				}
			},
		};
	},
};
