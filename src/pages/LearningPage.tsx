import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTopicStore } from '../stores/topicStore'
import { useNoteStore } from '../stores/noteStore'
import { NoteChunk } from '../types'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function LearningPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const { topics } = useTopicStore()
  const { getNotesByTopic, toggleChunkLearned } = useNoteStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [mode, setMode] = useState<'all' | 'unlearned'>('all')

  const topic = topics.find((t) => t.id === topicId)
  const topicNotes = topicId ? getNotesByTopic(topicId) : []

  // 모든 청크를 하나의 배열로 합침
  const allChunks = useMemo(() => {
    const chunks: (NoteChunk & { noteId: string })[] = []
    topicNotes.forEach((note) => {
      note.chunks.forEach((chunk) => {
        chunks.push({ ...chunk, noteId: note.id })
      })
    })
    return chunks
  }, [topicNotes])

  // 필터링된 청크
  const filteredChunks = useMemo(() => {
    if (mode === 'unlearned') {
      return allChunks.filter((chunk) => !chunk.learned)
    }
    return allChunks
  }, [allChunks, mode])

  const currentChunk = filteredChunks[currentIndex]
  const learnedCount = allChunks.filter((c) => c.learned).length
  const progress = allChunks.length > 0 ? (learnedCount / allChunks.length) * 100 : 0

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

  const goNext = () => {
    if (currentIndex < filteredChunks.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowContent(false)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowContent(false)
    }
  }

  const handleToggleLearned = () => {
    if (currentChunk) {
      toggleChunkLearned(currentChunk.noteId, currentChunk.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(`/topic/${topicId}`)}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topic
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Learn & Memorize</h1>
          <p className="text-gray-500">{topic.title}</p>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* 진행 상황 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">
              {learnedCount} / {allChunks.length} learned
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* 모드 선택 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setMode('all')
              setCurrentIndex(0)
              setShowContent(false)
            }}
          >
            All ({allChunks.length})
          </Button>
          <Button
            variant={mode === 'unlearned' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setMode('unlearned')
              setCurrentIndex(0)
              setShowContent(false)
            }}
          >
            Unlearned ({allChunks.filter((c) => !c.learned).length})
          </Button>
        </div>

        {/* 플래시카드 */}
        {filteredChunks.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {mode === 'unlearned' ? 'All chunks learned!' : 'No chunks yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {mode === 'unlearned'
                ? 'Great job! Try practicing your speech again.'
                : 'Collect some chunks from articles first.'}
            </p>
            <Button onClick={() => navigate(`/input/${topicId}`)}>
              Collect Input
            </Button>
          </Card>
        ) : (
          <>
            {/* 카드 번호 */}
            <div className="text-center text-sm text-gray-500 mb-4">
              {currentIndex + 1} / {filteredChunks.length}
            </div>

            {/* 플래시카드 */}
            <Card
              className={`min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                currentChunk?.learned ? 'border-green-300 bg-green-50' : ''
              }`}
              onClick={() => setShowContent(!showContent)}
            >
              {!showContent ? (
                <div className="text-center">
                  <div className="text-3xl mb-4">
                    {currentChunk?.keyword || '🤔'}
                  </div>
                  <p className="text-gray-500 text-sm">Click to reveal</p>
                </div>
              ) : (
                <div className="text-center px-8">
                  {currentChunk?.keyword && (
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      {currentChunk.keyword}
                    </div>
                  )}
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {currentChunk?.content}
                  </p>
                </div>
              )}
            </Card>

            {/* 컨트롤 */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="secondary"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                ← Previous
              </Button>

              <Button
                variant={currentChunk?.learned ? 'secondary' : 'primary'}
                onClick={handleToggleLearned}
              >
                {currentChunk?.learned ? '✓ Learned' : 'Mark as Learned'}
              </Button>

              <Button
                variant="secondary"
                onClick={goNext}
                disabled={currentIndex === filteredChunks.length - 1}
              >
                Next →
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
