import { create } from 'zustand';

export const useUiStore = create((set) => ({
  selectedBookingId: null,
  setSelectedBooking: (id) => set({ selectedBookingId: id }),
  activeProperty: null,
  setActiveProperty: (id) => set({ activeProperty: id }),
  toasts: [],
  addToast: (message, type = 'success') => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), message, type }],
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));
