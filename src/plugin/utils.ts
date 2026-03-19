import type { AstNode } from "./types.js";

const TEST_FILENAME_PATTERN = /\.(test|spec)\.[cm]?[jt]sx?$/;

export const isTestFilename = (filename: string | undefined): boolean =>
	typeof filename === "string" && TEST_FILENAME_PATTERN.test(filename);

export const toNode = (value: unknown): AstNode | null => {
	if (!value || typeof value !== "object") return null;
	const type = Reflect.get(value, "type");
	if (typeof type !== "string") return null;
	return value as AstNode;
};

export const toNodeArray = (value: unknown): ReadonlyArray<AstNode> => {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => toNode(entry)).filter((entry): entry is AstNode => entry !== null);
};

export const getNode = (node: AstNode, key: string): AstNode | null => toNode(node[key]);

export const getNodeArray = (node: AstNode, key: string): ReadonlyArray<AstNode> => toNodeArray(node[key]);

export const getString = (value: unknown): string | null =>
	typeof value === "string" ? value : null;

export const getIdentifierName = (value: unknown): string | null => {
	const node = toNode(value);
	if (!node || node.type !== "Identifier") return null;
	return getString(node.name);
};

export const getLiteralString = (value: unknown): string | null => {
	const node = toNode(value);
	if (!node || node.type !== "Literal") return null;
	return getString(node.value);
};

export const getMemberPropertyName = (value: unknown): string | null => {
	const member = toNode(value);
	if (!member || member.type !== "MemberExpression") return null;
	const computed = member.computed === true;
	if (computed) {
		return getLiteralString(member.property);
	}
	return getIdentifierName(member.property);
};

export const isMemberExpressionCall = (
	node: AstNode,
	objectName: string,
	propertyNameSet: ReadonlySet<string>,
): boolean => {
	if (node.type !== "CallExpression") return false;
	const callee = toNode(node.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	const objectNameValue = getIdentifierName(callee.object);
	if (objectNameValue !== objectName) return false;
	const propertyName = getMemberPropertyName(callee);
	return propertyName !== null && propertyNameSet.has(propertyName);
};

export const isEffectCallExpression = (value: unknown): boolean => {
	const node = toNode(value);
	if (!node || node.type !== "CallExpression") return false;
	const callee = toNode(node.callee);
	if (!callee || callee.type !== "MemberExpression") return false;
	return getIdentifierName(callee.object) === "Effect";
};

export const extractFunctionName = (node: AstNode): string | null => {
	if (node.type === "FunctionDeclaration") {
		return getIdentifierName(node.id);
	}

	if (node.type === "MethodDefinition") {
		return getIdentifierName(node.key) ?? getLiteralString(node.key);
	}

	if (node.type === "VariableDeclarator") {
		return getIdentifierName(node.id);
	}

	return null;
};

export const splitWords = (value: string): ReadonlyArray<string> => {
	if (value.length === 0) return [];
	const normalized = value.replace(/[-_]/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	if (normalized.length === 0) return [];
	return normalized
		.split(/\s+/)
		.map((segment) => segment.toLowerCase())
		.filter((segment) => segment.length > 0);
};

export const firstLowercaseToken = (name: string): string | null => {
	const match = /^([a-z]+)/.exec(name);
	return match?.[1] ?? null;
};

export const isFunctionValue = (node: AstNode): boolean =>
	node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";

export const isDefaultFallbackNode = (value: unknown): boolean => {
	const node = toNode(value);
	if (!node) return true;

	if (node.type === "Literal") return true;
	if (node.type === "ObjectExpression" || node.type === "ArrayExpression") return true;

	if (node.type === "Identifier") {
		const name = getString(node.name);
		return name === "undefined";
	}

	if (node.type === "UnaryExpression") {
		return node.operator === "void";
	}

	return false;
};

export const walkAst = (node: unknown, visitor: (candidate: AstNode) => void): void => {
	const current = toNode(node);
	if (!current) return;

	visitor(current);
	for (const [key, value] of Object.entries(current)) {
		if (key === "parent" || value == null) continue;
		if (Array.isArray(value)) {
			for (const item of value) {
				walkAst(item, visitor);
			}
			continue;
		}
		if (typeof value === "object") {
			walkAst(value, visitor);
		}
	}
};

const FIXTURE_OR_DOCS_PATTERN =
	/\.(fixture|mock|stub)\.[cm]?[jt]sx?$|(?:^|\/)(__fixtures__|__mocks__|docs|fixtures)\//;

export const isFixtureOrDocsFile = (filename: string | undefined): boolean =>
	typeof filename === "string" && FIXTURE_OR_DOCS_PATTERN.test(filename);

const COMPOSITION_ROOT_PATTERN =
	/(?:^|\/)(?:layers?|composition|bootstrap|wire|di|providers?)(?:\.[cm]?[jt]sx?$|\/)/;

export const isCompositionRootFile = (filename: string | undefined): boolean =>
	typeof filename === "string" && COMPOSITION_ROOT_PATTERN.test(filename);

const DOMAIN_PATTERN = /(?:^|\/)(?:domain|model|core)\//;

export const isDomainFile = (filename: string | undefined): boolean =>
	typeof filename === "string" && DOMAIN_PATTERN.test(filename);

type ArchitecturalLayer = "ui" | "app" | "domain" | "infra";

const LAYER_PATTERNS: ReadonlyArray<readonly [ArchitecturalLayer, RegExp]> = [
	["ui", /(?:^|\/)(?:ui|components|pages|views)\//],
	["app", /(?:^|\/)(?:app|application|services)\//],
	["domain", /(?:^|\/)(?:domain|model|core)\//],
	["infra", /(?:^|\/)(?:infra|infrastructure|adapters|external)\//],
];

const LAYER_ORDER: Readonly<Record<ArchitecturalLayer, number>> = {
	ui: 0,
	app: 1,
	domain: 2,
	infra: 3,
};

export const getArchitecturalLayer = (filename: string | undefined): ArchitecturalLayer | null => {
	if (!filename) return null;
	for (const [layer, pattern] of LAYER_PATTERNS) {
		if (pattern.test(filename)) return layer;
	}
	return null;
};

export const isLayerViolation = (
	fromLayer: ArchitecturalLayer,
	toLayer: ArchitecturalLayer,
): boolean => LAYER_ORDER[fromLayer] > LAYER_ORDER[toLayer];

export const serializeAstForComparison = (node: unknown): string => {
	const current = toNode(node);
	if (!current) return "";

	const parts: string[] = [current.type];

	if (current.type === "Literal" && current.value !== undefined) {
		parts.push(String(current.value));
	}

	if (current.type === "Identifier" && typeof current.name === "string") {
		parts.push(current.name);
	}

	if (typeof current.operator === "string") {
		parts.push(current.operator);
	}

	for (const [key, value] of Object.entries(current)) {
		if (key === "type" || key === "parent" || key === "start" || key === "end" ||
			key === "loc" || key === "range" || key === "raw" || key === "comments" ||
			key === "leadingComments" || key === "trailingComments" || value == null) continue;
		if (Array.isArray(value)) {
			for (const item of value) {
				parts.push(serializeAstForComparison(item));
			}
		} else if (typeof value === "object") {
			parts.push(serializeAstForComparison(value));
		}
	}

	return parts.join("|");
};
