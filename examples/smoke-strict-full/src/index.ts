import { loadUserCard } from "./domain/user-service.js";
import { useAppStore } from "./store/app-store.js";

export const strictFullSmokeId = "strict-full";

export const createSmokeSnapshot = (): {
	readonly smokeId: string;
	readonly storeLabel: string;
	readonly workflowName: string;
} => ({
	smokeId: strictFullSmokeId,
	storeLabel: typeof useAppStore,
	workflowName: loadUserCard.name,
});
