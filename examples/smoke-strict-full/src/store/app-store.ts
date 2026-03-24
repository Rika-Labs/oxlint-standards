import { create } from "zustand";

type AppStoreState = {
	readonly selectedUserId: string | null;
	readonly selectUser: (userId: string) => void;
};

export const useAppStore = create<AppStoreState>((setState) => ({
	selectedUserId: null,
	selectUser: (userId: string): void => {
		setState({ selectedUserId: userId });
	},
}));
