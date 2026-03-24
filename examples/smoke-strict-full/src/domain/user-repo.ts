import { eq, type SQL } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { UserCardViewModel } from "../shared/types.js";

const accountTeams = pgTable("account_teams", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});

const userProfiles = pgTable("user_profiles", {
	id: text("id").primaryKey(),
	displayName: text("display_name").notNull(),
	emailAddress: text("email_address").notNull(),
	teamId: text("team_id")
		.notNull()
		.references(() => accountTeams.id),
});

const profileAuditEntries = pgTable("profile_audit_entries", {
	id: text("id").primaryKey(),
	actionName: text("action_name").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => userProfiles.id),
	recordedAt: timestamp("recorded_at").notNull(),
});

export type UserProfileRecord = typeof userProfiles.$inferSelect;

type QueryFilter<TSelection> = {
	readonly where: (...filters: readonly [SQL]) => Promise<ReadonlyArray<TSelection>>;
};

type UpdateMutation<TSelection> = {
	readonly set: (patch: Readonly<Partial<TSelection>>) => {
		readonly where: (...filters: readonly [SQL]) => Promise<void>;
	};
};

type InsertMutation<TSelection> = {
	readonly values: (record: TSelection) => Promise<void>;
};

type UserProfileDatabase = {
	readonly insert: <TSelection>(table: unknown) => InsertMutation<TSelection>;
	readonly select: <TSelection>() => {
		readonly from: (table: unknown) => QueryFilter<TSelection>;
	};
	readonly transaction: <TReturn>(
		scope: (transaction: UserProfileDatabase) => Promise<TReturn>,
	) => Promise<TReturn>;
	readonly update: <TSelection>(table: unknown) => UpdateMutation<TSelection>;
};

export const readUserCardRecord = async (
	database: UserProfileDatabase,
	userId: string,
): Promise<UserCardViewModel | undefined> => {
	const matchingProfiles = await database
		.select<UserProfileRecord>()
		.from(userProfiles)
		.where(eq(userProfiles.id, userId));

	if (matchingProfiles.length === 0) {
		return undefined;
	}

	const [profileRecord] = matchingProfiles;

	return {
		avatarLabel: profileRecord.displayName.slice(0, 1).toUpperCase(),
		displayName: profileRecord.displayName,
		emailAddress: profileRecord.emailAddress,
		userId: profileRecord.id,
	};
};

export const renameUserProfile = async (
	database: UserProfileDatabase,
	userId: string,
	nextDisplayName: string,
): Promise<void> => {
	await database.transaction(async (transaction) => {
		await transaction
			.update<UserProfileRecord>(userProfiles)
			.set({ displayName: nextDisplayName })
			.where(eq(userProfiles.id, userId));

		await transaction.insert<typeof profileAuditEntries.$inferInsert>(profileAuditEntries).values({
			actionName: "rename-user-profile",
			id: `audit-${userId}`,
			recordedAt: new Date("2026-03-24T00:00:00.000Z"),
			userId,
		});
	});
};
