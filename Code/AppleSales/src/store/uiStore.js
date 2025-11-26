import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Mobile menu state
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // Modals
  modals: {
    tradeInCalculator: false,
    deviceDetail: false,
    appointmentBooking: false,
    reservationConfirm: false,
  },
  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),
  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),
  closeAllModals: () =>
    set((state) => ({
      modals: Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
    })),

  // Loading states
  loadingStates: {},
  setLoading: (key, isLoading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    })),

  // Sidebar state (for admin/sales)
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  // Filters visibility
  showFilters: false,
  toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

  // Search query
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearchQuery: () => set({ searchQuery: '' }),
}));
