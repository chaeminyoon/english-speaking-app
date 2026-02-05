import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTopicStore } from '../stores/topicStore'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Modal from '../components/common/Modal'

export default function HomePage() {
  const navigate = useNavigate()
  const { topics, addTopic, deleteTopic } = useTopicStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicDesc, setNewTopicDesc] = useState('')

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim()) return

    const topic = addTopic(newTopicTitle.trim(), newTopicDesc.trim() || undefined)
    setIsModalOpen(false)
    setNewTopicTitle('')
    setNewTopicDesc('')
    navigate(`/topic/${topic.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            English Speaking Practice
          </h1>
          <Button onClick={() => navigate('/settings')} variant="ghost">
            Settings
          </Button>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 새 주제 만들기 버튼 */}
        <div className="mb-8">
          <Button onClick={() => setIsModalOpen(true)} size="lg">
            + New Topic
          </Button>
        </div>

        {/* 주제 목록 */}
        {topics.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No topics yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first topic to start practicing!
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              Create First Topic
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                hoverable
                onClick={() => navigate(`/topic/${topic.id}`)}
                className="relative group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this topic?')) {
                      deleteTopic(topic.id)
                    }
                  }}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-8">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {topic.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Practice: {topic.practiceCount}x</span>
                  <span>
                    {new Date(topic.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 새 주제 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Topic"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic Title *
            </label>
            <input
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="e.g., Disadvantages of Remote Work"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              placeholder="Brief description of the topic..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTopic} disabled={!newTopicTitle.trim()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
