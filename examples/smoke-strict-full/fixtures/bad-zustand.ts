import { create } from "zustand";

type SidebarState = {
	readonly isOpen: boolean;
};

export const useSidebarState = create<SidebarState>(() => ({
	isOpen: false,
}));
