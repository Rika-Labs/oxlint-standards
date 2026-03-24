import { eq, type SQL } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const accountTeams = pgTable("account_teams", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
	id: text("id").primaryKey(),
	displayName: text("display_name").notNull(),
	teamId: text("team_id")
		.notNull()
		.references(() => accountTeams.id),
});

export const profileAuditEntries = pgTable("profile_audit_entries", {
	id: text("id").primaryKey(),
	actionName: text("action_name").notNull(),
	recordedAt: timestamp("recorded_at").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => userProfiles.id),
});

export type UserProfileRecord = typeof userProfiles.$inferSelect;

type SelectQuery<TSelection> = {
	readonly where: (...filters: readonly [SQL]) => Promise<ReadonlyArray<TSelection>>;
};

type UpdateQuery<TSelection> = {
	readonly set: (patch: Readonly<Partial<TSelection>>) => {
		readonly where: (...filters: readonly [SQL]) => Promise<void>;
	};
};

type InsertQuery<TSelection> = {
	readonly values: (record: TSelection) => Promise<void>;
};

type UserProfileDatabase = {
	readonly insert: <TSelection>(table: unknown) => InsertQuery<TSelection>;
	readonly select: <TSelection>() => {
		readonly from: (table: unknown) => SelectQuery<TSelection>;
	};
	readonly transaction: <TReturn>(
		scope: (transaction: UserProfileDatabase) => Promise<TReturn>,
	) => Promise<TReturn>;
	readonly update: <TSelection>(table: unknown) => UpdateQuery<TSelection>;
};

export const readUserProfile = async (
	database: UserProfileDatabase,
	userId: string,
): Promise<UserProfileRecord | undefined> => {
	const matchingProfiles = await database
		.select<UserProfileRecord>()
		.from(userProfiles)
		.where(eq(userProfiles.id, userId));

	return matchingProfiles[0];
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
