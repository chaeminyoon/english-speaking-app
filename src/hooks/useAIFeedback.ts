import { useState, useCallback } from 'react'
import { generateSpeechFeedback } from '../services/ai'
import { useSettingsStore } from '../stores/settingsStore'

interface Feedback {
  grammarFeedback: string[]
  expressionSuggestions: string[]
  overallComment: string
}

interface UseAIFeedbackReturn {
  feedback: Feedback | null
  isGenerating: boolean
  error: string | null
  generateFeedback: (transcript: string, topic: string) => Promise<Feedback | null>
  clearFeedback: () => void
}

export function useAIFeedback(): UseAIFeedbackReturn {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { aiProvider, getCurrentApiKey } = useSettingsStore()

  const generateFeedback = useCallback(
    async (transcript: string, topic: string): Promise<Feedback | null> => {
      const apiKey = getCurrentApiKey()
      if (aiProvider !== 'ollama' && !apiKey) {
        setError(`API key for ${aiProvider} is not configured. Please set it in Settings.`)
        return null
      }

      if (!transcript.trim()) {
        setError('No transcript to analyze')
        return null
      }

      setIsGenerating(true)
      setError(null)

      try {
        const result = await generateSpeechFeedback(transcript, topic)
        setFeedback(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate feedback'
        setError(message)
        return null
      } finally {
        setIsGenerating(false)
      }
    },
    [aiProvider, getCurrentApiKey]
  )

  const clearFeedback = useCallback(() => {
    setFeedback(null)
    setError(null)
  }, [])

  return {
    feedback,
    isGenerating,
    error,
    generateFeedback,
    clearFeedback,
  }
}
