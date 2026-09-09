import { create } from 'zustand'
import i18n from '@/lib/i18n'

interface UiState {
  currentLanguage: string
  isSidebarOpen: boolean
  isVoiceModalOpen: boolean
  searchQuery: string
  setLanguage: (lang: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  setVoiceModalOpen: (isOpen: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  currentLanguage: localStorage.getItem('sanjeevani_lang') || 'en',
  isSidebarOpen: false,
  isVoiceModalOpen: false,
  searchQuery: '',

  setLanguage: (lang: string) => {
    localStorage.setItem('sanjeevani_lang', lang)
    i18n.changeLanguage(lang)
    set({ currentLanguage: lang })
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  setVoiceModalOpen: (isOpen: boolean) => set({ isVoiceModalOpen: isOpen }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}))
