import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings } from '../types'

interface SettingsState extends AppSettings {
  setApiKey: (key: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'ko' | 'en') => void
  clearApiKey: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openaiApiKey: undefined,
      theme: 'light',
      language: 'ko',

      setApiKey: (key) => {
        set({ openaiApiKey: key })
      },

      setTheme: (theme) => {
        set({ theme })
      },

      setLanguage: (language) => {
        set({ language })
      },

      clearApiKey: () => {
        set({ openaiApiKey: undefined })
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)
