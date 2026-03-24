import { $ } from "bun";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rawConfig = JSON.parse(
	readFileSync(new URL("../oxlint.smoke.json", import.meta.url), "utf8"),
) as { ignorePatterns?: unknown };

delete rawConfig.ignorePatterns;

const rootDirectory = new URL("..", import.meta.url).pathname;
const tempConfigPath = join(rootDirectory, "oxlint.fixtures.tmp.json");
const tempInputPath = join(rootDirectory, ".oxlint-fixture-input");
writeFileSync(tempConfigPath, `${JSON.stringify(rawConfig, null, "\t")}\n`);
rmSync(tempInputPath, { force: true, recursive: true });
cpSync(join(rootDirectory, "fixtures"), tempInputPath, { recursive: true });

const result = await $`oxlint -c ${tempConfigPath} ${tempInputPath}/`.quiet().nothrow();
const output = result.stderr.toString() + result.stdout.toString();
rmSync(tempConfigPath, { force: true });
rmSync(tempInputPath, { force: true, recursive: true });

const match = output.match(/Found \d+ warnings and (\d+) errors/);
const errorCount = match ? Number(match[1]) : 0;

const EXPECTED_MIN = 6;

if (errorCount < EXPECTED_MIN) {
	console.error(`Expected at least ${EXPECTED_MIN} errors from fixtures but got ${errorCount}`);
	console.error(output);
	process.exit(1);
}

console.log(`strict-web fixtures produced ${errorCount} errors (expected >=${EXPECTED_MIN})`);
