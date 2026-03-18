import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

type CatalogEntry = {
	readonly id: string;
	readonly nearestBuiltIn: string;
	readonly whyInsufficient: string;
};

const rootDir = process.cwd();
const catalogPath = resolve(rootDir, "src/plugin/rule-catalog.json");
const catalogRaw = readFileSync(catalogPath, "utf8");
const catalog = JSON.parse(catalogRaw) as ReadonlyArray<CatalogEntry>;

const overlapProcess = spawnSync("bunx", ["oxlint", "--rules"], {
	encoding: "utf8",
	stdio: ["ignore", "pipe", "pipe"],
});

if (overlapProcess.status !== 0) {
	const stderr = overlapProcess.stderr || "";
	throw new Error(`Failed to query oxlint built-in rules. ${stderr}`);
}

const builtInRules = new Set<string>();
const lines = overlapProcess.stdout.split("\n");
for (const line of lines) {
	if (!line.startsWith("| ")) continue;
	if (line.startsWith("| Rule name")) continue;
	if (line.includes("----")) continue;
	const columns = line
		.split("|")
		.map((column) => column.trim())
		.filter((column) => column.length > 0);
	if (columns.length < 2) continue;
	const ruleName = columns[0];
	const pluginName = columns[1];
	if (!ruleName || !pluginName) continue;
	builtInRules.add(`${pluginName}/${ruleName}`);
}

const failures: Array<string> = [];
for (const entry of catalog) {
	if (!entry.id.startsWith("@rikalabs/")) {
		failures.push(`Rule '${entry.id}' must use @rikalabs namespace.`);
	}
	if (!entry.nearestBuiltIn || !entry.whyInsufficient) {
		failures.push(`Rule '${entry.id}' is missing built-in gap documentation.`);
	}

	const shortRuleName = entry.id.replace("@rikalabs/", "");
	for (const builtInRule of builtInRules) {
		const builtInName = builtInRule.split("/")[1] ?? "";
		if (builtInName !== shortRuleName) continue;
		failures.push(
			`Rule '${entry.id}' conflicts with built-in rule name '${builtInRule}'. Rename or remove it.`,
		);
	}
}

if (failures.length > 0) {
	const message = failures.map((failure) => `- ${failure}`).join("\n");
	throw new Error(`Built-in overlap validation failed:\n${message}`);
}

console.log(`Checked ${catalog.length} custom rules against ${builtInRules.size} built-in rules.`);
