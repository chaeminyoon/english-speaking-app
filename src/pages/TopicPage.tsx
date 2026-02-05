import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTopicStore } from '../stores/topicStore'
import { useNoteStore } from '../stores/noteStore'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function TopicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { topics, setCurrentTopic, currentTopic } = useTopicStore()
  const { getNotesByTopic } = useNoteStore()

  const topic = topics.find((t) => t.id === id)
  const notes = id ? getNotesByTopic(id) : []

  useEffect(() => {
    if (topic) {
      setCurrentTopic(topic)
    }
  }, [topic, setCurrentTopic])

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Topic not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const steps = [
    {
      step: 1,
      title: 'Impromptu Speech',
      description: 'Record your speech without any preparation',
      icon: '🎙️',
      path: `/speech/${id}`,
      color: 'bg-red-50 border-red-200 hover:border-red-400',
    },
    {
      step: 2,
      title: 'Collect Input',
      description: 'Browse articles and take notes',
      icon: '🌐',
      path: `/input/${id}`,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    },
    {
      step: 3,
      title: 'Learn & Memorize',
      description: 'Study your collected chunks',
      icon: '📖',
      path: `/learning/${id}`,
      color: 'bg-green-50 border-green-200 hover:border-green-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topics
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
          {topic.description && (
            <p className="text-gray-500 mt-1">{topic.description}</p>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 진행 상황 */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Progress</h2>
              <p className="text-sm text-gray-500">
                Practice count: {topic.practiceCount} rounds
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Notes collected</p>
              <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
            </div>
          </div>
        </Card>

        {/* 학습 사이클 단계 */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Learning Cycle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {steps.map((step) => (
            <Card
              key={step.step}
              hoverable
              onClick={() => navigate(step.path)}
              className={`${step.color} border-2 transition-all`}
            >
              <div className="text-center py-4">
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="text-sm text-gray-500 mb-1">Step {step.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* 최근 노트 */}
        {notes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Notes
            </h2>
            <div className="space-y-2">
              {notes.slice(0, 3).map((note) => (
                <Card key={note.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{note.title}</h3>
                    <p className="text-sm text-gray-500">
                      {note.chunks.length} chunks collected
                    </p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
