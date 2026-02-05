import { useState, useCallback } from 'react'
import { transcribeAudio } from '../services/openai'
import { useSettingsStore } from '../stores/settingsStore'

interface UseSpeechToTextReturn {
  transcript: string | null
  isTranscribing: boolean
  error: string | null
  transcribe: (audioBlob: Blob) => Promise<string | null>
  clearTranscript: () => void
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openaiApiKey } = useSettingsStore()

  const transcribe = useCallback(
    async (audioBlob: Blob): Promise<string | null> => {
      if (!openaiApiKey) {
        setError('OpenAI API key is not configured. Please set it in Settings.')
        return null
      }

      setIsTranscribing(true)
      setError(null)

      try {
        const text = await transcribeAudio(audioBlob)
        setTranscript(text)
        return text
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to transcribe'
        setError(message)
        return null
      } finally {
        setIsTranscribing(false)
      }
    },
    [openaiApiKey]
  )

  const clearTranscript = useCallback(() => {
    setTranscript(null)
    setError(null)
  }, [])

  return {
    transcript,
    isTranscribing,
    error,
    transcribe,
    clearTranscript,
  }
}
