import { Effect } from "effect";

export const unsafeWorkflow = Effect.gen(function* () {
	let mutableCounter = 0;
	mutableCounter += 1;
	yield* Effect.succeed(mutableCounter);
	return mutableCounter;
});

export const rawPromiseWorkflow = (): Promise<string> =>
	new Promise((resolve) => {
		resolve("raw");
	});

export const spanlessEffect = Effect.fn("spanlessEffect")(function* () {
	return yield* Effect.succeed("missing span format");
});
