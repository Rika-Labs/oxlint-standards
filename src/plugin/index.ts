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
};

const plugin = {
	meta: {
		name: "@rikalabs",
	},
	rules: customRules,
};

export default plugin;
