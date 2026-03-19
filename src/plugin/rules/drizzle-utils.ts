import type { AstNode } from "../types.js";
import {
	getCallChain,
	getImportSources,
	getMemberPropertyName,
	isFixtureOrDocsFile,
	isMigrationFile,
	isTestFilename,
	serializeAstForComparison,
	toNode,
	walkAst,
} from "../utils.js";

const DRIZZLE_IMPORT_PATTERN = /^drizzle-orm(?:\/|$)/;
const DRIZZLE_FILENAME_PATTERN =
	/(?:^|\/)(?:db|database|schema|repositories?|repos?|services?|drizzle)(?:\/|$)/;

export const DRIZZLE_WRITE_METHODS = new Set(["insert", "update", "delete"]);
export const DRIZZLE_QUERY_METHODS = new Set(["select", "insert", "update", "delete", "query", "execute"]);

export const isDrizzleFile = (program: AstNode, filename: string | undefined): boolean => {
	for (const source of getImportSources(program)) {
		if (DRIZZLE_IMPORT_PATTERN.test(source)) return true;
	}

	return typeof filename === "string" && DRIZZLE_FILENAME_PATTERN.test(filename);
};

export const isDrizzleIgnoredFile = (filename: string | undefined): boolean =>
	isTestFilename(filename) || isFixtureOrDocsFile(filename) || isMigrationFile(filename);

export const getMethodCalleeName = (node: AstNode): string | null => {
	if (node.type !== "CallExpression") return null;
	const callee = toNode(node.callee);
	if (!callee || callee.type !== "MemberExpression") return null;
	return getMemberPropertyName(callee);
};

export const isMethodCall = (node: AstNode, methodNames: ReadonlySet<string>): boolean => {
	const methodName = getMethodCalleeName(node);
	return methodName !== null && methodNames.has(methodName);
};

export const collectNestedStarterCallSerializations = (
	value: unknown,
	methodNames: ReadonlySet<string>,
): ReadonlySet<string> => {
	const serializations = new Set<string>();

	const visit = (candidateValue: unknown): void => {
		const candidate = toNode(candidateValue);
		if (!candidate) return;

		if (candidate.type === "CallExpression") {
			if (isMethodCall(candidate, methodNames)) {
				serializations.add(serializeAstForComparison(candidate));
			}

			const callee = toNode(candidate.callee);
			if (callee && callee.type === "MemberExpression") {
				visit(callee.object);
			}
			return;
		}

		if (candidate.type === "MemberExpression") {
			visit(candidate.object);
		}
	};

	visit(value);
	return serializations;
};

export const hasMethodInChain = (value: unknown, methodNames: ReadonlySet<string>): boolean => {
	const callChain = getCallChain(value);
	if (!callChain) return false;
	return callChain.members.some((member) => methodNames.has(member));
};

export const countWriteCalls = (node: AstNode): number => {
	let count = 0;

	walkAst(node, (candidate) => {
		if (candidate.type !== "CallExpression") return;
		if (isMethodCall(candidate, DRIZZLE_WRITE_METHODS)) {
			count += 1;
		}
	});

	return count;
};

const TRANSACTION_METHODS = new Set(["transaction", "withTransaction"]);

export const collectTransactionScopedWriteSerializations = (node: AstNode): ReadonlySet<string> => {
	const safeWrites = new Set<string>();

	walkAst(node, (candidate) => {
		if (candidate.type !== "CallExpression") return;
		const methodName = getMethodCalleeName(candidate);
		if (!methodName || !TRANSACTION_METHODS.has(methodName)) return;

		const args = Array.isArray(candidate.arguments) ? candidate.arguments : [];
		for (const arg of args) {
			walkAst(arg, (inner) => {
				if (inner.type !== "CallExpression") return;
				if (!isMethodCall(inner, DRIZZLE_WRITE_METHODS)) return;

				safeWrites.add(serializeAstForComparison(inner));
			});
		}
	});

	return safeWrites;
};

const QUERY_LOOP_METHODS = new Set(["select", "insert", "update", "delete", "execute", "findMany", "findFirst"]);

export const isDrizzleQueryCall = (node: AstNode): boolean => {
	if (node.type !== "CallExpression") return false;
	if (isMethodCall(node, QUERY_LOOP_METHODS)) return true;

	const callChain = getCallChain(node);
	if (!callChain) return false;

	return callChain.members.includes("query");
};
