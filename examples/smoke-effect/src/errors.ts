export class UserProfileNotFoundError extends Error {
	readonly _tag = "UserProfileNotFoundError";
	readonly userId: string;

	constructor(userId: string) {
		super(`No user profile exists for ${userId}.`);
		this.name = "UserProfileNotFoundError";
		this.userId = userId;
	}
}
