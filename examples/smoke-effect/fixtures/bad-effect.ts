import { Effect } from "effect";

export const badTryCatch = (): string => {
	try {
		return "ok";
	} catch (error) {
		void error;
		return "fail";
	}
};

export const badAsync = async (): Promise<string> => {
	return "bad";
};

export const badPromise = (): Promise<string> => {
	return new Promise((resolve) => resolve("bad"));
};

export const badOrDie = (): unknown => Effect.fail(new Error("Missing user profile.")).orDie();

export const badGenericFail = (): unknown => Effect.fail("generic failure");
