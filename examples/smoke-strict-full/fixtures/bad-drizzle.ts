import { sql } from "drizzle-orm";

const userProfiles = {} as never;

type UnsafeDatabase = {
	readonly delete: (table: unknown) => Promise<void>;
	readonly execute: (statement: unknown) => Promise<void>;
	readonly select: () => {
		readonly from: (table: unknown) => Promise<void>;
	};
	readonly update: (table: unknown) => {
		readonly set: (patch: unknown) => Promise<void>;
	};
};

export const wipeProfiles = async (database: UnsafeDatabase): Promise<void> => {
	await database.delete(userProfiles);
};

export const runCrudStatement = async (database: UnsafeDatabase): Promise<void> => {
	await database.execute(sql`DELETE FROM user_profiles`);
};

export const readEveryProfile = async (database: UnsafeDatabase): Promise<void> => {
	await database.select().from(userProfiles);
};

export const renameEveryProfile = async (database: UnsafeDatabase): Promise<void> => {
	await database.update(userProfiles).set({ displayName: "all-users" });
};
