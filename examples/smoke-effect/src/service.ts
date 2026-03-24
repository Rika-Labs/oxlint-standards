import { Effect } from "effect";
import { UserProfileNotFoundError } from "./errors.js";

type UserProfile = {
	readonly displayName: string;
	readonly userId: string;
};

const userProfiles = new Map<string, UserProfile>([["user-1", {
		displayName: "Ada Lovelace",
		userId: "user-1",
	}]]);

export const loadUserProfile = Effect.fn("UserProfileService.loadUserProfile")(function* loadUserProfileEffect(
	userId: string,
) {
	const matchedProfile = yield* Effect.succeed(userProfiles.get(userId));
	if (matchedProfile === undefined) {
		return yield* Effect.fail(new UserProfileNotFoundError(userId));
	}

	return matchedProfile;
});
