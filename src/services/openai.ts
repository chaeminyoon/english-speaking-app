import { useSettingsStore } from '../stores/settingsStore'

const OPENAI_API_URL = 'https://api.openai.com/v1'

// API 키 가져오기
function getApiKey(): string {
  const apiKey = useSettingsStore.getState().openaiApiKey
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set it in Settings.')
  }
  return apiKey
}

// 음성을 텍스트로 변환 (Whisper API)
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = getApiKey()

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.wav')
  formData.append('model', 'whisper-1')
  formData.append('language', 'en') // 영어로 고정

  const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to transcribe audio')
  }

  const data = await response.json()
  return data.text
}

// 스피치 피드백 생성 (GPT-4)
export async function generateSpeechFeedback(
  transcript: string,
  topic: string
): Promise<{
  grammarFeedback: string[]
  expressionSuggestions: string[]
  overallComment: string
}> {
  const apiKey = getApiKey()

  const systemPrompt = `You are an English speaking coach. Analyze the following speech transcript and provide constructive feedback.

Topic: ${topic}

Provide your feedback in JSON format with the following structure:
{
  "grammarFeedback": ["list of grammar corrections or suggestions"],
  "expressionSuggestions": ["list of better expressions or phrases they could use"],
  "overallComment": "brief overall feedback and encouragement"
}

Be encouraging but also helpful. Focus on practical improvements.`

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to generate feedback')
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  try {
    return JSON.parse(content)
  } catch {
    return {
      grammarFeedback: [],
      expressionSuggestions: [],
      overallComment: content,
    }
  }
}

// 텍스트를 쉬운 영어로 변환
export async function simplifyEnglish(text: string): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that simplifies English text. Rewrite the following text using simpler vocabulary and shorter sentences while preserving the meaning. Make it easy for English learners to understand.',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.5,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to simplify text')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 키워드 자동 추출
export async function extractKeyword(chunk: string): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Extract 1-2 key words from the following English phrase or sentence. Return only the keyword(s), nothing else.',
        },
        { role: 'user', content: chunk },
      ],
      temperature: 0.3,
      max_tokens: 20,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to extract keyword')
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// 요약 자동 생성
export async function generateSummary(chunks: string[]): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Write a brief 1-2 sentence summary of the main points from the following phrases/sentences. Write in simple English.',
        },
        { role: 'user', content: chunks.join('\n') },
      ],
      temperature: 0.5,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to generate summary')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
