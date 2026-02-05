import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTopicStore } from '../stores/topicStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSpeechToText } from '../hooks/useSpeechToText'
import { useAIFeedback } from '../hooks/useAIFeedback'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

interface Recording {
  url: string
  blob: Blob
  duration: number
  timestamp: Date
  transcript?: string
}

export default function SpeechPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { topics, incrementPracticeCount } = useTopicStore()
  const { openaiApiKey } = useSettingsStore()

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)

  const { transcript, isTranscribing, error: sttError, transcribe } = useSpeechToText()
  const { feedback, isGenerating, error: feedbackError, generateFeedback } = useAIFeedback()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const recordingTimeRef = useRef(0)

  const topic = topics.find((t) => t.id === topicId)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      recordings.forEach((rec) => URL.revokeObjectURL(rec.url))
    }
  }, [])

  if (!topic || !topicId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Topic not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Debug: Log available tracks
      console.log('Audio tracks:', stream.getAudioTracks().map(t => ({ label: t.label, enabled: t.enabled, muted: t.muted })))

      // Use supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg;codecs=opus'

      console.log('Using MIME type:', mimeType)

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes')
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log('Recording stopped. Total chunks:', audioChunksRef.current.length)
        const totalSize = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0)
        console.log('Total audio size:', totalSize, 'bytes')

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log('Final blob size:', audioBlob.size, 'bytes')

        const url = URL.createObjectURL(audioBlob)
        const newRecording: Recording = {
          url,
          blob: audioBlob,
          duration: recordingTimeRef.current,
          timestamp: new Date(),
        }
        setRecordings((prev) => [...prev, newRecording])
        setSelectedRecording(newRecording)
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording with timeslice (collect data every 100ms)
      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingTime(0)
      recordingTimeRef.current = 0

      timerRef.current = window.setInterval(() => {
        recordingTimeRef.current += 1
        setRecordingTime(recordingTimeRef.current)
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied. Please allow microphone access to record.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      incrementPracticeCount(topicId)
    }
  }

  const handleTranscribe = async () => {
    if (!selectedRecording) return
    const text = await transcribe(selectedRecording.blob)
    if (text) {
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.timestamp === selectedRecording.timestamp
            ? { ...rec, transcript: text }
            : rec
        )
      )
      setSelectedRecording((prev) => (prev ? { ...prev, transcript: text } : null))
    }
  }

  const handleGetFeedback = async () => {
    const text = selectedRecording?.transcript || transcript
    if (!text) return
    await generateFeedback(text, topic.title)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentTranscript = selectedRecording?.transcript || transcript

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/topic/${topicId}`)}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topic
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Impromptu Speech</h1>
          <p className="text-gray-500">{topic.title}</p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 녹음 */}
          <div className="space-y-6">
            {/* 안내 */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Tips</h3>
                  <ul className="text-sm text-blue-800 mt-1 space-y-1">
                    <li>- Speak without any preparation</li>
                    <li>- Focus on communication, not perfection</li>
                    <li>- Try to speak as long as you can</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* 녹음 컨트롤 */}
            <Card>
              <div className="text-center py-6">
                <div className="text-5xl font-mono font-bold text-gray-900 mb-6">
                  {formatTime(recordingTime)}
                </div>

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 recording-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  {isRecording ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                  )}
                </button>

                <p className="mt-3 text-sm text-gray-500">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
              </div>
            </Card>

            {/* 녹음 목록 */}
            {recordings.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Recordings ({recordings.length})
                </h3>
                <div className="space-y-2">
                  {recordings.map((rec, index) => (
                    <div
                      key={rec.timestamp.getTime()}
                      onClick={() => setSelectedRecording(rec)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedRecording?.timestamp === rec.timestamp
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Recording {index + 1}</span>
                        <span className="text-sm text-gray-500">
                          {formatTime(rec.duration)}
                        </span>
                      </div>
                      <audio controls src={rec.url} className="w-full h-8" />
                      {rec.transcript && (
                        <p className="mt-2 text-xs text-green-600">Transcribed</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* 오른쪽: STT & 피드백 */}
          <div className="space-y-6">
            {/* API 키 경고 */}
            {!openaiApiKey && (
              <Card className="bg-yellow-50 border-yellow-200">
                <div className="flex gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="font-semibold text-yellow-900">API Key Required</h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      To use STT and AI feedback, please configure your OpenAI API key.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/settings')}
                    >
                      Go to Settings
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STT 결과 */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Transcript</h3>
                <Button
                  size="sm"
                  onClick={handleTranscribe}
                  disabled={!selectedRecording || isTranscribing || !openaiApiKey}
                >
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </Button>
              </div>

              {sttError && (
                <p className="text-sm text-red-500 mb-2">{sttError}</p>
              )}

              {currentTranscript ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {currentTranscript}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Select a recording and click Transcribe to convert speech to text.
                </p>
              )}
            </Card>

            {/* AI 피드백 */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">AI Feedback</h3>
                <Button
                  size="sm"
                  onClick={handleGetFeedback}
                  disabled={!currentTranscript || isGenerating || !openaiApiKey}
                >
                  {isGenerating ? 'Generating...' : 'Get Feedback'}
                </Button>
              </div>

              {feedbackError && (
                <p className="text-sm text-red-500 mb-2">{feedbackError}</p>
              )}

              {feedback ? (
                <div className="space-y-4">
                  {/* Overall Comment */}
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">{feedback.overallComment}</p>
                  </div>

                  {/* Grammar Feedback */}
                  {feedback.grammarFeedback.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Grammar Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {feedback.grammarFeedback.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-yellow-500">-</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expression Suggestions */}
                  {feedback.expressionSuggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Better Expressions
                      </h4>
                      <ul className="space-y-1">
                        {feedback.expressionSuggestions.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-blue-500">+</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Get a transcript first, then click Get Feedback for AI analysis.
                </p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
