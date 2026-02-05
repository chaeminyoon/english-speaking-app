import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, AIProvider } from '../types'

interface SettingsState extends AppSettings {
  setAiProvider: (provider: AIProvider) => void
  setOpenAIApiKey: (key: string) => void
  setClaudeApiKey: (key: string) => void
  setGeminiApiKey: (key: string) => void
  setOllamaBaseUrl: (url: string) => void
  setSelectedModel: (model: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'ko' | 'en') => void
  clearAllApiKeys: () => void
  getCurrentApiKey: () => string | undefined
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      aiProvider: 'openai',
      openaiApiKey: undefined,
      claudeApiKey: undefined,
      geminiApiKey: undefined,
      ollamaBaseUrl: 'http://localhost:11434',
      selectedModel: undefined,
      theme: 'light',
      language: 'ko',

      setAiProvider: (provider) => {
        set({ aiProvider: provider })
      },

      setOpenAIApiKey: (key) => {
        set({ openaiApiKey: key })
      },

      setClaudeApiKey: (key) => {
        set({ claudeApiKey: key })
      },

      setGeminiApiKey: (key) => {
        set({ geminiApiKey: key })
      },

      setOllamaBaseUrl: (url) => {
        set({ ollamaBaseUrl: url })
      },

      setSelectedModel: (model) => {
        set({ selectedModel: model })
      },

      setTheme: (theme) => {
        set({ theme })
      },

      setLanguage: (language) => {
        set({ language })
      },

      clearAllApiKeys: () => {
        set({
          openaiApiKey: undefined,
          claudeApiKey: undefined,
          geminiApiKey: undefined,
        })
      },

      getCurrentApiKey: () => {
        const state = get()
        switch (state.aiProvider) {
          case 'openai':
            return state.openaiApiKey
          case 'claude':
            return state.claudeApiKey
          case 'gemini':
            return state.geminiApiKey
          default:
            return undefined
        }
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)

// 각 provider별 기본 모델 목록
export const AI_MODELS = {
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (추천)' },
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  claude: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (추천)' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  ],
  gemini: [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (추천)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
  ],
  ollama: [
    { id: 'llama3.2', name: 'Llama 3.2' },
    { id: 'mistral', name: 'Mistral' },
    { id: 'qwen2.5', name: 'Qwen 2.5' },
    { id: 'gemma2', name: 'Gemma 2' },
  ],
}
