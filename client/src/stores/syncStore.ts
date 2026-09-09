import { create } from 'zustand'

interface SyncState {
  pendingMutationsCount: number
  isSyncing: boolean
  lastSyncedAt: string | null
  incrementPending: () => void
  decrementPending: () => void
  setPendingCount: (count: number) => void
  setIsSyncing: (isSyncing: boolean) => void
  setLastSyncedAt: (timestamp: string) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  pendingMutationsCount: 0,
  isSyncing: false,
  lastSyncedAt: localStorage.getItem('sanjeevani_last_synced') || null,

  incrementPending: () =>
    set((state) => ({ pendingMutationsCount: state.pendingMutationsCount + 1 })),

  decrementPending: () =>
    set((state) => ({
      pendingMutationsCount: Math.max(0, state.pendingMutationsCount - 1),
    })),

  setPendingCount: (count: number) => set({ pendingMutationsCount: count }),

  setIsSyncing: (isSyncing: boolean) => set({ isSyncing }),

  setLastSyncedAt: (timestamp: string) => {
    localStorage.setItem('sanjeevani_last_synced', timestamp)
    set({ lastSyncedAt: timestamp })
  },
}))
