import { useSettingsStore, AI_MODELS } from '../stores/settingsStore'
import { AIProvider } from '../types'

// API 설정 가져오기
function getAIConfig(): { provider: AIProvider; apiKey: string; model: string; baseUrl?: string } {
    const state = useSettingsStore.getState()
    const provider = state.aiProvider

    let apiKey = ''
    let model = state.selectedModel || ''
    let baseUrl: string | undefined

    switch (provider) {
        case 'openai':
            apiKey = state.openaiApiKey || ''
            model = model || 'gpt-4o-mini'
            break
        case 'claude':
            apiKey = state.claudeApiKey || ''
            model = model || 'claude-3-5-sonnet-20241022'
            break
        case 'gemini':
            apiKey = state.geminiApiKey || ''
            model = model || 'gemini-1.5-flash'
            break
        case 'ollama':
            baseUrl = state.ollamaBaseUrl || 'http://localhost:11434'
            model = model || 'llama3.2'
            break
    }

    if (provider !== 'ollama' && !apiKey) {
        throw new Error(`API key for ${provider} is not configured. Please set it in Settings.`)
    }

    return { provider, apiKey, model, baseUrl }
}

// 통합 채팅 완성 API
async function chatCompletion(
    systemPrompt: string,
    userMessage: string,
    options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<string> {
    const { provider, apiKey, model, baseUrl } = getAIConfig()
    const { temperature = 0.7, maxTokens, jsonMode = false } = options

    switch (provider) {
        case 'openai':
            return await openaiChat(apiKey, model, systemPrompt, userMessage, temperature, maxTokens, jsonMode)
        case 'claude':
            return await claudeChat(apiKey, model, systemPrompt, userMessage, temperature, maxTokens)
        case 'gemini':
            return await geminiChat(apiKey, model, systemPrompt, userMessage, temperature)
        case 'ollama':
            return await ollamaChat(baseUrl!, model, systemPrompt, userMessage, temperature)
        default:
            throw new Error(`Unsupported provider: ${provider}`)
    }
}

// OpenAI API
async function openaiChat(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    temperature: number,
    maxTokens?: number,
    jsonMode?: boolean
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature,
            ...(maxTokens && { max_tokens: maxTokens }),
            ...(jsonMode && { response_format: { type: 'json_object' } }),
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return data.choices[0].message.content
}

// Claude API
async function claudeChat(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    temperature: number,
    maxTokens?: number
): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model,
            max_tokens: maxTokens || 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            temperature,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    return data.content[0].text
}

// Gemini API
async function geminiChat(
    apiKey: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    temperature: number
): Promise<string> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }],
                    },
                ],
                generationConfig: {
                    temperature,
                },
            }),
        }
    )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Gemini API error')
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

// Ollama API
async function ollamaChat(
    baseUrl: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    temperature: number
): Promise<string> {
    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: false,
            options: { temperature },
        }),
    })

    if (!response.ok) {
        throw new Error('Ollama API error - make sure Ollama is running')
    }

    const data = await response.json()
    return data.message.content
}

// ========== 기존 함수들 (통합 API 사용) ==========

// 음성을 텍스트로 변환 (OpenAI Whisper만 지원)
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    const state = useSettingsStore.getState()
    const apiKey = state.openaiApiKey

    if (!apiKey) {
        throw new Error('OpenAI API key is required for speech-to-text. Please set it in Settings.')
    }

    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
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

// 스피치 피드백 생성
export async function generateSpeechFeedback(
    transcript: string,
    topic: string
): Promise<{
    grammarFeedback: string[]
    expressionSuggestions: string[]
    overallComment: string
}> {
    const systemPrompt = `You are an English speaking coach. Analyze the following speech transcript and provide constructive feedback.

Topic: ${topic}

Provide your feedback in JSON format with the following structure:
{
  "grammarFeedback": ["list of grammar corrections or suggestions"],
  "expressionSuggestions": ["list of better expressions or phrases they could use"],
  "overallComment": "brief overall feedback and encouragement"
}

Be encouraging but also helpful. Focus on practical improvements.`

    const content = await chatCompletion(systemPrompt, transcript, { temperature: 0.7, jsonMode: true })

    try {
        // JSON 추출 시도
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
        }
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
    const systemPrompt =
        'You are a helpful assistant that simplifies English text. Rewrite the following text using simpler vocabulary and shorter sentences while preserving the meaning. Make it easy for English learners to understand.'

    return await chatCompletion(systemPrompt, text, { temperature: 0.5 })
}

// 키워드 자동 추출
export async function extractKeyword(chunk: string): Promise<string> {
    const systemPrompt =
        'Extract 1-2 key words from the following English phrase or sentence. Return only the keyword(s), nothing else.'

    return await chatCompletion(systemPrompt, chunk, { temperature: 0.3, maxTokens: 20 })
}

// 요약 자동 생성
export async function generateSummary(chunks: string[]): Promise<string> {
    const systemPrompt =
        'Write a brief 1-2 sentence summary of the main points from the following phrases/sentences. Write in simple English.'

    return await chatCompletion(systemPrompt, chunks.join('\n'), { temperature: 0.5 })
}
