import { noAiDebtCommentsRule } from "./rules/no-ai-debt-comments.js";
import { noCatchReturnErrorObjectRule } from "./rules/no-catch-return-error-object.js";
import { noDoubleTypeAssertionRule } from "./rules/no-double-type-assertion.js";
import { noJsonParseDefaultFallbackRule } from "./rules/no-json-parse-default-fallback.js";
import { noJsonStringifyDefaultFallbackRule } from "./rules/no-json-stringify-default-fallback.js";
import { effectCatchHandlerMustUseErrorRule } from "./rules/effect-catch-handler-must-use-error.js";
import { effectNoEffectReturnInMapRule } from "./rules/effect-no-effect-return-in-map.js";
import { effectNoGenericErrorFailRule } from "./rules/effect-no-generic-error-fail.js";
import { effectNoOrDieRule } from "./rules/effect-no-or-die.js";
import { effectNoTerminalRunnersRule } from "./rules/effect-no-terminal-runners.js";
import { effectPreferGenOverFlatmapChainRule } from "./rules/effect-prefer-gen-over-flatmap-chain.js";
import { effectRequireSpanNameRule } from "./rules/effect-require-span-name.js";
import { noAsNeverRule } from "./rules/no-as-never.js";
import { noDuplicateContextRule } from "./rules/no-duplicate-context.js";
import { noImportThenReexportRule } from "./rules/no-import-then-reexport.js";
import { noIsRecordHelpersRule } from "./rules/no-is-record-helpers.js";
import { noRuntimeCompatFallbacksRule } from "./rules/no-runtime-compat-fallbacks.js";
import { noSilentCatchFallbackRule } from "./rules/no-silent-catch-fallback.js";
import { noUnlistedExternalImportsRule } from "./rules/no-unlisted-external-imports.js";
import { noVagueVerbsRule } from "./rules/no-vague-verbs.js";
import { noTodoWithoutIssueRule } from "./rules/no-todo-without-issue.js";
import { noDisableWithoutRationaleRule } from "./rules/no-disable-without-rationale.js";
import { noGenericModuleNamesRule } from "./rules/no-generic-module-names.js";
import { noDefaultExportInDomainRule } from "./rules/no-default-export-in-domain.js";
import { effectNoAsyncInsideSyncRule } from "./rules/effect-no-async-inside-sync.js";
import { effectPreferRunmainEntrypointRule } from "./rules/effect-prefer-runmain-entrypoint.js";
import { noLowSignalPublicNamesRule } from "./rules/no-low-signal-public-names.js";
import { effectNoTacitUsageRule } from "./rules/effect-no-tacit-usage.js";
import { effectNoProvideInDomainRule } from "./rules/effect-no-provide-in-domain.js";
import { effectNoLayerInLeafModulesRule } from "./rules/effect-no-layer-in-leaf-modules.js";
import { noPlaceholderImplementationRule } from "./rules/no-placeholder-implementation.js";
import { noAnemicErrorsRule } from "./rules/no-anemic-errors.js";
import { effectRequireTaggedErrorsRule } from "./rules/effect-require-tagged-errors.js";
import { noExportedAnyRule } from "./rules/no-exported-any.js";
import { noInlineExportedObjectTypesRule } from "./rules/no-inline-exported-object-types.js";
import { noBagOfOptionalsRule } from "./rules/no-bag-of-optionals.js";
import { requireBrandedIdsRule } from "./rules/require-branded-ids.js";
import { effectNoPromiseServiceMethodsRule } from "./rules/effect-no-promise-service-methods.js";
import { effectNoThrowInServicesRule } from "./rules/effect-no-throw-in-services.js";
import { effectNoFireAndForgetForkRule } from "./rules/effect-no-fire-and-forget-fork.js";
import { noIdenticalBranchesRule } from "./rules/no-identical-branches.js";
import { requireExhaustiveTagSwitchRule } from "./rules/require-exhaustive-tag-switch.js";
import { noRelativeCrossPackageImportsRule } from "./rules/no-relative-cross-package-imports.js";
import { noCrossLayerImportsRule } from "./rules/no-cross-layer-imports.js";
import { noCopyPasteExportsRule } from "./rules/no-copy-paste-exports.js";
import type { RuleModule } from "./types.js";

export const customRules: Readonly<Record<string, RuleModule>> = {
	"no-vague-verbs": noVagueVerbsRule,
	"no-duplicate-context": noDuplicateContextRule,
	"no-import-then-reexport": noImportThenReexportRule,
	"no-is-record-helpers": noIsRecordHelpersRule,
	"no-silent-catch-fallback": noSilentCatchFallbackRule,
	"no-runtime-compat-fallbacks": noRuntimeCompatFallbacksRule,
	"no-catch-return-error-object": noCatchReturnErrorObjectRule,
	"no-unlisted-external-imports": noUnlistedExternalImportsRule,
	"no-double-type-assertion": noDoubleTypeAssertionRule,
	"no-ai-debt-comments": noAiDebtCommentsRule,
	"no-json-parse-default-fallback": noJsonParseDefaultFallbackRule,
	"no-json-stringify-default-fallback": noJsonStringifyDefaultFallbackRule,
	"no-as-never": noAsNeverRule,
	"effect-no-or-die": effectNoOrDieRule,
	"effect-catch-handler-must-use-error": effectCatchHandlerMustUseErrorRule,
	"effect-no-terminal-runners": effectNoTerminalRunnersRule,
	"effect-no-generic-error-fail": effectNoGenericErrorFailRule,
	"effect-prefer-gen-over-flatmap-chain": effectPreferGenOverFlatmapChainRule,
	"effect-no-effect-return-in-map": effectNoEffectReturnInMapRule,
	"effect-require-span-name": effectRequireSpanNameRule,
	"no-todo-without-issue": noTodoWithoutIssueRule,
	"no-disable-without-rationale": noDisableWithoutRationaleRule,
	"no-generic-module-names": noGenericModuleNamesRule,
	"no-default-export-in-domain": noDefaultExportInDomainRule,
	"effect-no-async-inside-sync": effectNoAsyncInsideSyncRule,
	"effect-prefer-runmain-entrypoint": effectPreferRunmainEntrypointRule,
	"no-low-signal-public-names": noLowSignalPublicNamesRule,
	"effect-no-tacit-usage": effectNoTacitUsageRule,
	"effect-no-provide-in-domain": effectNoProvideInDomainRule,
	"effect-no-layer-in-leaf-modules": effectNoLayerInLeafModulesRule,
	"no-placeholder-implementation": noPlaceholderImplementationRule,
	"no-anemic-errors": noAnemicErrorsRule,
	"effect-require-tagged-errors": effectRequireTaggedErrorsRule,
	"no-exported-any": noExportedAnyRule,
	"no-inline-exported-object-types": noInlineExportedObjectTypesRule,
	"no-bag-of-optionals": noBagOfOptionalsRule,
	"require-branded-ids": requireBrandedIdsRule,
	"effect-no-promise-service-methods": effectNoPromiseServiceMethodsRule,
	"effect-no-throw-in-services": effectNoThrowInServicesRule,
	"effect-no-fire-and-forget-fork": effectNoFireAndForgetForkRule,
	"no-identical-branches": noIdenticalBranchesRule,
	"require-exhaustive-tag-switch": requireExhaustiveTagSwitchRule,
	"no-relative-cross-package-imports": noRelativeCrossPackageImportsRule,
	"no-cross-layer-imports": noCrossLayerImportsRule,
	"no-copy-paste-exports": noCopyPasteExportsRule,
};

const plugin = {
	meta: {
		name: "@rikalabs",
	},
	rules: customRules,
};

export default plugin;
