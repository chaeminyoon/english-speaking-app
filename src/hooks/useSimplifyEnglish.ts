import { useState, useCallback } from 'react'
import { simplifyEnglish as simplifyEnglishAPI } from '../services/ai'
import { useSettingsStore } from '../stores/settingsStore'

interface UseSimplifyEnglishReturn {
  simplifiedText: string | null
  isSimplifying: boolean
  error: string | null
  simplify: (text: string) => Promise<string | null>
  clear: () => void
}

export function useSimplifyEnglish(): UseSimplifyEnglishReturn {
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null)
  const [isSimplifying, setIsSimplifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { aiProvider, getCurrentApiKey } = useSettingsStore()

  const simplify = useCallback(
    async (text: string): Promise<string | null> => {
      const apiKey = getCurrentApiKey()
      if (aiProvider !== 'ollama' && !apiKey) {
        setError(`API key for ${aiProvider} is not configured. Please set it in Settings.`)
        return null
      }

      if (!text.trim()) {
        setError('No text to simplify')
        return null
      }

      setIsSimplifying(true)
      setError(null)

      try {
        const result = await simplifyEnglishAPI(text)
        setSimplifiedText(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to simplify text'
        setError(message)
        return null
      } finally {
        setIsSimplifying(false)
      }
    },
    [aiProvider, getCurrentApiKey]
  )

  const clear = useCallback(() => {
    setSimplifiedText(null)
    setError(null)
  }, [])

  return {
    simplifiedText,
    isSimplifying,
    error,
    simplify,
    clear,
  }
}
