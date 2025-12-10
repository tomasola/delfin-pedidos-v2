import { create } from 'zustand';

interface SyncState {
    status: 'idle' | 'syncing' | 'synced' | 'error';
    lastSync: Date | null;
    autoSyncEnabled: boolean;
    setStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
    setLastSync: (date: Date) => void;
    toggleAutoSync: () => void;
}

export const useSyncState = create<SyncState>((set) => ({
    status: 'idle',
    lastSync: null,
    autoSyncEnabled: true,
    setStatus: (status) => set({ status }),
    setLastSync: (date) => set({ lastSync: date, status: 'synced' }),
    toggleAutoSync: () => set((state) => ({ autoSyncEnabled: !state.autoSyncEnabled })),
}));

// Auto-sync every 5 minutes if enabled
let autoSyncInterval: NodeJS.Timeout | null = null;

export function setupAutoSync(syncFunction: () => Promise<void>) {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }

    autoSyncInterval = setInterval(async () => {
        const { autoSyncEnabled, status } = useSyncState.getState();

        if (autoSyncEnabled && status !== 'syncing') {
            try {
                await syncFunction();
            } catch (error) {
                console.error('Auto-sync failed:', error);
            }
        }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }
    };
}
