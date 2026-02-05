import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTopicStore } from '../stores/topicStore'
import { useNoteStore } from '../stores/noteStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useSimplifyEnglish } from '../hooks/useSimplifyEnglish'
import { extractKeyword, generateSummary } from '../services/openai'
import WebviewBrowser from '../components/browser/WebviewBrowser'
import CornellNote from '../components/notes/CornellNote'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'

export default function InputPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { topics } = useTopicStore()
  const { openaiApiKey } = useSettingsStore()
  const {
    currentNote,
    createNote,
    setCurrentNote,
    getNotesByTopic,
    addChunk,
    updateChunk,
    deleteChunk,
    toggleChunkLearned,
    updateSummary,
  } = useNoteStore()

  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [isSimplifyModalOpen, setIsSimplifyModalOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [isGeneratingKeyword, setIsGeneratingKeyword] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const { simplifiedText, isSimplifying, error: simplifyError, simplify, clear: clearSimplify } = useSimplifyEnglish()

  const topic = topics.find((t) => t.id === topicId)
  const topicNotes = topicId ? getNotesByTopic(topicId) : []

  // 페이지 로드 시 첫 번째 노트 선택
  useEffect(() => {
    if (topicNotes.length > 0 && !currentNote) {
      setCurrentNote(topicNotes[0])
    }
  }, [topicNotes, currentNote, setCurrentNote])

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

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return
    const note = createNote(topicId, newNoteTitle.trim())
    setCurrentNote(note)
    setIsNewNoteModalOpen(false)
    setNewNoteTitle('')
  }

  const handleTextSelected = (text: string) => {
    if (!currentNote) {
      setNewNoteTitle('New Note')
      setIsNewNoteModalOpen(true)
      return
    }
    addChunk(currentNote.id, text)
  }

  const handleSimplifyRequest = (text: string) => {
    setSelectedText(text)
    setIsSimplifyModalOpen(true)
    clearSimplify()
  }

  const handleSimplify = async () => {
    if (!selectedText) return
    await simplify(selectedText)
  }

  const handleAddSimplifiedToNote = () => {
    if (!currentNote || !simplifiedText) return
    addChunk(currentNote.id, simplifiedText)
    setIsSimplifyModalOpen(false)
    clearSimplify()
    setSelectedText('')
  }

  const handleAutoKeyword = async (chunkId: string, content: string) => {
    if (!openaiApiKey) return
    setIsGeneratingKeyword(true)
    try {
      const keyword = await extractKeyword(content)
      if (currentNote) {
        updateChunk(currentNote.id, chunkId, { keyword })
      }
    } catch (err) {
      console.error('Failed to extract keyword:', err)
    } finally {
      setIsGeneratingKeyword(false)
    }
  }

  const handleAutoSummary = async () => {
    if (!currentNote || !openaiApiKey || currentNote.chunks.length === 0) return
    setIsGeneratingSummary(true)
    try {
      const chunks = currentNote.chunks.map((c) => c.content)
      const summary = await generateSummary(chunks)
      updateSummary(currentNote.id, summary)
    } catch (err) {
      console.error('Failed to generate summary:', err)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/topic/${topicId}`)}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Collect Input</h1>
            <p className="text-sm text-gray-500">{topic.title}</p>
          </div>
        </div>

        {/* 노트 선택 / 생성 */}
        <div className="flex items-center gap-2">
          <select
            value={currentNote?.id || ''}
            onChange={(e) => {
              const note = topicNotes.find((n) => n.id === e.target.value)
              setCurrentNote(note || null)
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {topicNotes.length === 0 && (
              <option value="">No notes yet</option>
            )}
            {topicNotes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title} ({note.chunks.length} chunks)
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => setIsNewNoteModalOpen(true)}>
            + New Note
          </Button>
        </div>
      </header>

      {/* 메인 컨텐츠 - 분할 화면 */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* 왼쪽: Webview 브라우저 */}
        <div className="flex-1 min-w-0">
          <WebviewBrowser
            onTextSelected={handleTextSelected}
            onSimplifyRequest={handleSimplifyRequest}
            initialUrl="https://www.google.com/search?q=english+articles"
          />
        </div>

        {/* 오른쪽: 코넬 노트 */}
        <div className="w-[450px] flex-shrink-0 flex flex-col gap-2">
          {currentNote ? (
            <>
              <CornellNote
                title={currentNote.title}
                chunks={currentNote.chunks}
                summary={currentNote.summary}
                onUpdateChunk={(chunkId, updates) =>
                  updateChunk(currentNote.id, chunkId, updates)
                }
                onDeleteChunk={(chunkId) =>
                  deleteChunk(currentNote.id, chunkId)
                }
                onToggleLearned={(chunkId) =>
                  toggleChunkLearned(currentNote.id, chunkId)
                }
                onUpdateSummary={(summary) =>
                  updateSummary(currentNote.id, summary)
                }
                onAutoKeyword={openaiApiKey ? handleAutoKeyword : undefined}
              />
              {/* AI 기능 버튼 */}
              {openaiApiKey && currentNote.chunks.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAutoSummary}
                  disabled={isGeneratingSummary}
                  className="w-full"
                >
                  {isGeneratingSummary ? 'Generating...' : 'Auto-generate Summary'}
                </Button>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
              <div className="text-center p-8">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  No Note Selected
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Create a new note to start collecting chunks
                </p>
                <Button onClick={() => setIsNewNoteModalOpen(true)}>
                  Create Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 새 노트 모달 */}
      <Modal
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        title="Create New Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Title
            </label>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="e.g., Article from Medium"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNote()
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsNewNoteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNote} disabled={!newNoteTitle.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* 쉬운 영어로 변환 모달 */}
      <Modal
        isOpen={isSimplifyModalOpen}
        onClose={() => {
          setIsSimplifyModalOpen(false)
          clearSimplify()
          setSelectedText('')
        }}
        title="Simplify English"
        size="lg"
      >
        <div className="space-y-4">
          {/* 원본 텍스트 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Original Text
            </label>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800 max-h-32 overflow-y-auto">
              {selectedText}
            </div>
          </div>

          {/* 변환 버튼 */}
          {!simplifiedText && (
            <Button
              onClick={handleSimplify}
              disabled={isSimplifying || !openaiApiKey}
              className="w-full"
            >
              {isSimplifying ? 'Simplifying...' : 'Simplify to Easier English'}
            </Button>
          )}

          {!openaiApiKey && (
            <p className="text-sm text-yellow-600">
              Please configure OpenAI API key in Settings to use this feature.
            </p>
          )}

          {simplifyError && (
            <p className="text-sm text-red-500">{simplifyError}</p>
          )}

          {/* 변환된 텍스트 */}
          {simplifiedText && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Simplified Text
              </label>
              <div className="p-3 bg-green-50 rounded-lg text-sm text-gray-800 max-h-32 overflow-y-auto">
                {simplifiedText}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          {simplifiedText && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsSimplifyModalOpen(false)
                  clearSimplify()
                  setSelectedText('')
                }}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={handleAddSimplifiedToNote}
                disabled={!currentNote}
                className="flex-1"
              >
                Add to Notes
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
