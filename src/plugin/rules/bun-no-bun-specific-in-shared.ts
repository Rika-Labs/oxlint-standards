import type { RuleModule } from "../types.js";
import { getIdentifierName, getMemberPropertyName, hasImportSource, isTestFilename, toNode, walkAst } from "../utils.js";

const SHARED_PACKAGE_PATTERN = /(?:^|\/)(?:packages\/shared|shared)(?:\/|$)/;

const BUN_IMPORT_PATTERN = /^bun(?::|$)/;

const BUN_MEMBER_METHODS = new Set([
	"file",
	"write",
	"serve",
	"spawn",
	"sleep",
	"build",
	"hash",
	"dns",
	"password",
	"color",
]);

export const bunNoBunSpecificInSharedRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Bun-specific APIs in shared packages that must remain runtime-agnostic.",
		},
		messages: {
			bunImport:
				"Do not import from '{{source}}' in shared packages. Shared code must remain runtime-agnostic.",
			bunGlobal:
				"Do not use Bun.{{method}} in shared packages. Shared code must remain runtime-agnostic.",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename || !SHARED_PACKAGE_PATTERN.test(context.filename)) return {};

		return {
			Program(node) {
				if (hasImportSource(node, (source) => BUN_IMPORT_PATTERN.test(source))) {
					walkAst(node, (candidate) => {
						if (candidate.type !== "ImportDeclaration") return;
						const source = toNode(candidate.source);
						if (!source || source.type !== "Literal") return;
						const sourceValue = typeof source.value === "string" ? source.value : null;
						if (sourceValue && BUN_IMPORT_PATTERN.test(sourceValue)) {
							context.report({
								node: candidate,
								messageId: "bunImport",
								data: { source: sourceValue },
							});
						}
					});
				}

				walkAst(node, (candidate) => {
					if (candidate.type !== "MemberExpression") return;
					const objectName = getIdentifierName(candidate.object);
					if (objectName !== "Bun") return;

					const methodName = getMemberPropertyName(candidate);
					if (methodName && BUN_MEMBER_METHODS.has(methodName)) {
						context.report({
							node: candidate,
							messageId: "bunGlobal",
							data: { method: methodName },
						});
					}
				});
			},
		};
	},
};
