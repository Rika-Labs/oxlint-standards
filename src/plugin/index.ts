import { noAiDebtCommentsRule } from "./rules/no-ai-debt-comments.js";
import { noCatchReturnErrorObjectRule } from "./rules/no-catch-return-error-object.js";
import { noDoubleTypeAssertionRule } from "./rules/no-double-type-assertion.js";
import { noJsonParseDefaultFallbackRule } from "./rules/no-json-parse-default-fallback.js";
import { noJsonStringifyDefaultFallbackRule } from "./rules/no-json-stringify-default-fallback.js";
import { effectCatchHandlerMustUseErrorRule } from "./rules/effect-catch-handler-must-use-error.js";
import { drizzleEnforceDeleteWithWhereRule } from "./rules/drizzle-enforce-delete-with-where.js";
import { drizzleEnforceUpdateWithWhereRule } from "./rules/drizzle-enforce-update-with-where.js";
import { drizzleNoDriverQueryInDomainRule } from "./rules/drizzle-no-driver-query-in-domain.js";
import { drizzleNoQueryInLoopsRule } from "./rules/drizzle-no-query-in-loops.js";
import { drizzleNoRawSqlCrudRule } from "./rules/drizzle-no-raw-sql-crud.js";
import { drizzleNoUnboundedSelectRule } from "./rules/drizzle-no-unbounded-select.js";
import { drizzleRequireInferTypesRule } from "./rules/drizzle-require-infer-types.js";
import { drizzleRequireReferencesCallbackRule } from "./rules/drizzle-require-references-callback.js";
import { drizzleRequireTransactionScopeRule } from "./rules/drizzle-require-transaction-scope.js";
import { effectNoAsyncAwaitRule } from "./rules/effect-no-async-await.js";
import { effectNoEffectReturnInMapRule } from "./rules/effect-no-effect-return-in-map.js";
import { effectNoLoopedEffectsRule } from "./rules/effect-no-looped-effects.js";
import { effectNoGenericErrorFailRule } from "./rules/effect-no-generic-error-fail.js";
import { effectNoOrDieRule } from "./rules/effect-no-or-die.js";
import { effectNoRawPromisesRule } from "./rules/effect-no-raw-promises.js";
import { effectNoTerminalRunnersRule } from "./rules/effect-no-terminal-runners.js";
import { effectNoTryCatchRule } from "./rules/effect-no-try-catch.js";
import { effectPreferGenOverFlatmapChainRule } from "./rules/effect-prefer-gen-over-flatmap-chain.js";
import { effectRequireSpanNameRule } from "./rules/effect-require-span-name.js";
import { nextNoBrowserApiInServerComponentRule } from "./rules/next-no-browser-api-in-server-component.js";
import { nextNoPagesRouterApiInAppDirRule } from "./rules/next-no-pages-router-api-in-app-dir.js";
import { nextNoUseClientInRootFilesRule } from "./rules/next-no-use-client-in-root-files.js";
import { nextRequireServerDirectiveInActionsRule } from "./rules/next-require-server-directive-in-actions.js";
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
import { noTrivialRuntimeGuardHelpersRule } from "./rules/no-trivial-runtime-guard-helpers.js";
import { noTrivialPropertyHelpersRule } from "./rules/no-trivial-property-helpers.js";
import { noSingleUseTrivialHelpersRule } from "./rules/no-single-use-trivial-helpers.js";
import { noBareWrapperFunctionsRule } from "./rules/no-bare-wrapper-functions.js";
import { noPassThroughIntermediateVarsRule } from "./rules/no-pass-through-intermediate-vars.js";
import { noPropertyDefaultFallbacksRule } from "./rules/no-property-default-fallbacks.js";
import { noRedundantConstAssertionRule } from "./rules/no-redundant-const-assertion.js";
import { noTutorialCommentsRule } from "./rules/no-tutorial-comments.js";
import { noCommentedOutCodeRule } from "./rules/no-commented-out-code.js";
import { noDebugResidueFilenamesRule } from "./rules/no-debug-residue-filenames.js";
import { noLowSignalVariableNamesRule } from "./rules/no-low-signal-variable-names.js";
import { noStandaloneClassesRule } from "./rules/no-standalone-classes.js";
import { noHardcodedSecretsRule } from "./rules/no-hardcoded-secrets.js";
import { noSqlStringConcatRule } from "./rules/no-sql-string-concat.js";
import { noPlaceholderTestsRule } from "./rules/no-placeholder-tests.js";
import { noMockOnlyTestsRule } from "./rules/no-mock-only-tests.js";
import { electrobunNoRpcInDomainRule } from "./rules/electrobun-no-rpc-in-domain.js";
import { electrobunNoProcessGlobalInRendererRule } from "./rules/electrobun-no-process-global-in-renderer.js";
import { zustandNoStoreOutsideStoreDirRule } from "./rules/zustand-no-store-outside-store-dir.js";
import { zustandNoDirectSetInComponentsRule } from "./rules/zustand-no-direct-set-in-components.js";
import { bunNoBunSpecificInSharedRule } from "./rules/bun-no-bun-specific-in-shared.js";
import { effectNoMutableRefInGenRule } from "./rules/effect-no-mutable-ref-in-gen.js";
import { reactNoInlineEffectRunRule } from "./rules/react-no-inline-effect-run.js";
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
	"drizzle-enforce-delete-with-where": drizzleEnforceDeleteWithWhereRule,
	"drizzle-enforce-update-with-where": drizzleEnforceUpdateWithWhereRule,
	"drizzle-no-unbounded-select": drizzleNoUnboundedSelectRule,
	"drizzle-no-raw-sql-crud": drizzleNoRawSqlCrudRule,
	"drizzle-require-transaction-scope": drizzleRequireTransactionScopeRule,
	"drizzle-require-infer-types": drizzleRequireInferTypesRule,
	"drizzle-require-references-callback": drizzleRequireReferencesCallbackRule,
	"drizzle-no-driver-query-in-domain": drizzleNoDriverQueryInDomainRule,
	"drizzle-no-query-in-loops": drizzleNoQueryInLoopsRule,
	"effect-no-or-die": effectNoOrDieRule,
	"effect-catch-handler-must-use-error": effectCatchHandlerMustUseErrorRule,
	"effect-no-terminal-runners": effectNoTerminalRunnersRule,
	"effect-no-raw-promises": effectNoRawPromisesRule,
	"effect-no-try-catch": effectNoTryCatchRule,
	"effect-no-async-await": effectNoAsyncAwaitRule,
	"effect-no-generic-error-fail": effectNoGenericErrorFailRule,
	"effect-prefer-gen-over-flatmap-chain": effectPreferGenOverFlatmapChainRule,
	"effect-no-effect-return-in-map": effectNoEffectReturnInMapRule,
	"effect-no-looped-effects": effectNoLoopedEffectsRule,
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
	"next-no-browser-api-in-server-component": nextNoBrowserApiInServerComponentRule,
	"next-require-server-directive-in-actions": nextRequireServerDirectiveInActionsRule,
	"next-no-use-client-in-root-files": nextNoUseClientInRootFilesRule,
	"next-no-pages-router-api-in-app-dir": nextNoPagesRouterApiInAppDirRule,
	"no-trivial-runtime-guard-helpers": noTrivialRuntimeGuardHelpersRule,
	"no-trivial-property-helpers": noTrivialPropertyHelpersRule,
	"no-single-use-trivial-helpers": noSingleUseTrivialHelpersRule,
	"no-bare-wrapper-functions": noBareWrapperFunctionsRule,
	"no-pass-through-intermediate-vars": noPassThroughIntermediateVarsRule,
	"no-property-default-fallbacks": noPropertyDefaultFallbacksRule,
	"no-redundant-const-assertion": noRedundantConstAssertionRule,
	"no-tutorial-comments": noTutorialCommentsRule,
	"no-commented-out-code": noCommentedOutCodeRule,
	"no-debug-residue-filenames": noDebugResidueFilenamesRule,
	"no-low-signal-variable-names": noLowSignalVariableNamesRule,
	"no-standalone-classes": noStandaloneClassesRule,
	"no-hardcoded-secrets": noHardcodedSecretsRule,
	"no-sql-string-concat": noSqlStringConcatRule,
	"no-placeholder-tests": noPlaceholderTestsRule,
	"no-mock-only-tests": noMockOnlyTestsRule,
	"electrobun-no-rpc-in-domain": electrobunNoRpcInDomainRule,
	"electrobun-no-process-global-in-renderer": electrobunNoProcessGlobalInRendererRule,
	"zustand-no-store-outside-store-dir": zustandNoStoreOutsideStoreDirRule,
	"zustand-no-direct-set-in-components": zustandNoDirectSetInComponentsRule,
	"bun-no-bun-specific-in-shared": bunNoBunSpecificInSharedRule,
	"effect-no-mutable-ref-in-gen": effectNoMutableRefInGenRule,
	"react-no-inline-effect-run": reactNoInlineEffectRunRule,
};

const plugin = {
	meta: {
		name: "@rikalabs",
	},
	rules: customRules,
};

export default plugin;
