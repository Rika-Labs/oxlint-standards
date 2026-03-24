import type { RuleModule } from "../types.js";
import { getMemberPropertyName, isTestFilename, toNode, walkAst } from "../utils.js";

const DOMAIN_FILE_PATTERN =
	/(?:^|\/)(?:domain|services?|repos?|model|core)(?:\/|$)/;

const BOUNDARY_FILE_PATTERN =
	/(?:^|\/)(?:index|rpc|bridge|ipc)\.[cm]?[jt]sx?$/;

const RPC_OBJECT_NAMES = new Set([
	"electroview",
	"BrowserView",
	"mainview",
	"webview",
]);

export const electrobunNoRpcInDomainRule: RuleModule = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow Electrobun RPC calls in domain logic. RPC should only appear at boundary files.",
		},
		messages: {
			rpcInDomain:
				"Electrobun RPC call found in domain logic. Move RPC calls to boundary files (index.ts, rpc.ts, bridge.ts).",
		},
	},
	create(context) {
		if (isTestFilename(context.filename)) return {};
		if (!context.filename || !DOMAIN_FILE_PATTERN.test(context.filename)) return {};
		if (BOUNDARY_FILE_PATTERN.test(context.filename)) return {};

		return {
			Program(node) {
				walkAst(node, (candidate) => {
					if (candidate.type !== "CallExpression") return;
					const callee = toNode(candidate.callee);
					if (!callee || callee.type !== "MemberExpression") return;

					const objectNode = toNode(callee.object);
					if (!objectNode) return;

					if (objectNode.type === "MemberExpression") {
						const rootObject = toNode(objectNode.object);
						if (!rootObject || rootObject.type !== "Identifier") return;
						const rootName = typeof rootObject.name === "string" ? rootObject.name : null;
						if (!rootName || !RPC_OBJECT_NAMES.has(rootName)) return;

						const propertyName = getMemberPropertyName(objectNode);
						if (propertyName === "rpc") {
							context.report({ node: candidate, messageId: "rpcInDomain" });
						}
						return;
					}

					if (objectNode.type === "Identifier") {
						const objectName = typeof objectNode.name === "string" ? objectNode.name : null;
						if (!objectName || !RPC_OBJECT_NAMES.has(objectName)) return;
						const methodName = getMemberPropertyName(callee);
						if (methodName === "rpc") {
							context.report({ node: candidate, messageId: "rpcInDomain" });
						}
					}
				});
			},
		};
	},
};
