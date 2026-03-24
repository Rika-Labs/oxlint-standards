import { Effect } from "effect";
import type { UserCardViewModel } from "../shared/types.js";

const smokeUserCards = new Map<string, UserCardViewModel>([["user-1", {
		avatarLabel: "A",
		displayName: "Ada Lovelace",
		emailAddress: "ada@example.com",
		userId: "user-1",
	}]]);

export class UserProfileNotFoundError extends Error {
	readonly _tag = "UserProfileNotFoundError";
	readonly userId: string;

	constructor(userId: string) {
		super(`No user profile exists for ${userId}.`);
		this.name = "UserProfileNotFoundError";
		this.userId = userId;
	}
}

export const loadUserCard = Effect.fn("UserCardService.loadUserCard")(function* loadUserCardEffect(
	userId: string,
) {
	const matchedCard = yield* Effect.succeed(smokeUserCards.get(userId));
	if (matchedCard === undefined) {
		return yield* Effect.fail(new UserProfileNotFoundError(userId));
	}

	return matchedCard;
});
