import { create } from 'zustand';

interface AdminDirtyState {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
}

export const useAdminDirtyStore = create<AdminDirtyState>((set) => ({
  dirty: false,
  setDirty: (dirty) => set({ dirty }),
}));
