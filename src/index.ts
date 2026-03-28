export { default as plugin } from "./plugin/index.js";

export const presetNames = [
	"core-clean",
	"typescript-hard-mode",
	"imports-hygiene",
	"promise-safety",
	"naming-discipline",
	"effect-runtime",
	"effect-error-model",
	"effect-composition",
	"effect-observability",
	"strict-core",
	"strict-runtime",
	"strict-drizzle",
	"strict-web",
	"strict-tests",
	"strict-tests-jest",
	"strict-effect",
	"strict",
	"recommended",
] as const;

export type PresetName = (typeof presetNames)[number];
