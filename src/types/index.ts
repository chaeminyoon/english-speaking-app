// 주제 타입
export interface Topic {
  id: string
  title: string
  description?: string
  createdAt: Date
  updatedAt: Date
  practiceCount: number
}

// 스피치 녹음 타입
export interface SpeechRecording {
  id: string
  topicId: string
  audioBlob?: Blob
  audioUrl?: string
  transcript?: string
  duration: number
  createdAt: Date
  round: number // 몇 번째 연습인지
}

// 노트 Chunk 타입
export interface NoteChunk {
  id: string
  topicId: string
  content: string // 원본 문장/표현
  keyword?: string // 키워드
  learned: boolean
  createdAt: Date
}

// 코넬 노트 타입
export interface CornellNote {
  id: string
  topicId: string
  title: string
  chunks: NoteChunk[]
  summary?: string
  sourceUrl?: string
  createdAt: Date
  updatedAt: Date
}

// AI 피드백 타입
export interface AIFeedback {
  id: string
  speechId: string
  grammarFeedback: string[]
  expressionSuggestions: string[]
  overallComment: string
  createdAt: Date
}

// AI Provider 타입
export type AIProvider = 'openai' | 'claude' | 'gemini' | 'ollama'

// 앱 설정 타입
export interface AppSettings {
  aiProvider: AIProvider
  openaiApiKey?: string
  claudeApiKey?: string
  geminiApiKey?: string
  ollamaBaseUrl?: string
  selectedModel?: string
  theme: 'light' | 'dark'
  language: 'ko' | 'en'
}

// 학습 진행 상황 타입
export interface LearningProgress {
  topicId: string
  totalChunks: number
  learnedChunks: number
  speechRounds: number
  lastPracticeAt?: Date
}
