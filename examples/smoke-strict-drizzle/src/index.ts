import { readUserProfile, renameUserProfile } from "./repo.js";

export const strictDrizzleSmokeId = "strict-drizzle";

export const readRepositoryNames = (): ReadonlyArray<string> => [
	readUserProfile.name,
	renameUserProfile.name,
];
