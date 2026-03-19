import type { AstNode } from "../types.js";
import {
	getImportSources,
	getMemberPropertyName,
	isFixtureOrDocsFile,
	isTestFilename,
	serializeAstForComparison,
	toNode,
	walkAst,
} from "../utils.js";

const EFFECT_IMPORT_PATTERN = /^(?:effect|@effect\/)/;

export const EFFECT_TRY_METHODS = new Set(["try", "tryPromise"]);

export const isEffectFile = (program: AstNode, filename: string | undefined): boolean => {
	if (isTestFilename(filename) || isFixtureOrDocsFile(filename)) return false;

	for (const source of getImportSources(program)) {
		if (EFFECT_IMPORT_PATTERN.test(source)) return true;
	}

	return false;
};

export const collectSafeEffectBoundarySerializations = (program: AstNode): ReadonlySet<string> => {
	const safe = new Set<string>();

	walkAst(program, (candidate) => {
		if (candidate.type !== "CallExpression") return;
		const callee = toNode(candidate.callee);
		if (!callee || callee.type !== "MemberExpression") return;
		const methodName = getMemberPropertyName(callee);
		if (!methodName || !EFFECT_TRY_METHODS.has(methodName)) return;

		for (const arg of Array.isArray(candidate.arguments) ? candidate.arguments : []) {
			walkAst(arg, (inner) => {
				if (
					inner.type === "TryStatement" ||
					inner.type === "AwaitExpression" ||
					((inner.type === "ArrowFunctionExpression" ||
						inner.type === "FunctionExpression" ||
						inner.type === "FunctionDeclaration") &&
						inner.async === true) ||
					inner.type === "NewExpression" ||
					(inner.type === "CallExpression" &&
						["then", "catch", "finally"].includes(getMemberPropertyName(inner.callee) ?? ""))
				) {
					safe.add(serializeAstForComparison(inner));
				}
			});
		}
	});

	return safe;
};
