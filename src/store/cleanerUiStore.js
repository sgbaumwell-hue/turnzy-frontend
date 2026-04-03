import { create } from 'zustand';

export const useCleanerUiStore = create((set) => ({
  selectedJobId: null,
  setSelectedJob: (id) => set({ selectedJobId: id }),
}));
