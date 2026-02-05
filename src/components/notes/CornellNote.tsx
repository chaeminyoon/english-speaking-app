import { useState } from 'react'
import { NoteChunk } from '../../types'
import Button from '../common/Button'

interface CornellNoteProps {
  title: string
  chunks: NoteChunk[]
  summary?: string
  onAddChunk?: (content: string, keyword?: string) => void
  onUpdateChunk?: (chunkId: string, updates: Partial<NoteChunk>) => void
  onDeleteChunk?: (chunkId: string) => void
  onToggleLearned?: (chunkId: string) => void
  onUpdateSummary?: (summary: string) => void
  onAutoKeyword?: (chunkId: string, content: string) => void
}

export default function CornellNote({
  title,
  chunks,
  summary = '',
  onUpdateChunk,
  onDeleteChunk,
  onToggleLearned,
  onUpdateSummary,
  onAutoKeyword,
}: CornellNoteProps) {
  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryText, setSummaryText] = useState(summary)
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null)
  const [keywordText, setKeywordText] = useState('')

  const handleSaveSummary = () => {
    onUpdateSummary?.(summaryText)
    setEditingSummary(false)
  }

  const handleSaveKeyword = (chunkId: string) => {
    onUpdateChunk?.(chunkId, { keyword: keywordText })
    setEditingKeyword(null)
    setKeywordText('')
  }

  const startEditKeyword = (chunk: NoteChunk) => {
    setEditingKeyword(chunk.id)
    setKeywordText(chunk.keyword || '')
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 제목 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{chunks.length} chunks collected</p>
      </div>

      {/* 코넬 노트 본문 */}
      <div className="flex-1 grid grid-cols-[150px_1fr] overflow-hidden">
        {/* Keywords 영역 */}
        <div className="border-r border-gray-200 overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Keywords</h3>
          </div>
          <div className="p-2 space-y-2">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className={`p-2 rounded text-sm ${
                  chunk.learned ? 'bg-green-50 text-green-700' : 'bg-gray-50'
                }`}
              >
                {editingKeyword === chunk.id ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={keywordText}
                      onChange={(e) => setKeywordText(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="Keyword..."
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveKeyword(chunk.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKeyword(null)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() => startEditKeyword(chunk)}
                      className="cursor-pointer hover:text-blue-600 flex-1"
                      title="Click to edit keyword"
                    >
                      {chunk.keyword || (
                        <span className="text-gray-400 italic">Add...</span>
                      )}
                    </div>
                    {onAutoKeyword && !chunk.keyword && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onAutoKeyword(chunk.id, chunk.content)
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 ml-1"
                        title="Auto-extract keyword"
                      >
                        AI
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes 영역 */}
        <div className="flex flex-col overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Notes</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chunks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                <div className="text-center">
                  <p>No chunks yet</p>
                  <p className="text-xs mt-1">Select text from the browser and click "Add to Notes"</p>
                </div>
              </div>
            ) : (
              chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className={`group p-3 rounded-lg border ${
                    chunk.learned
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm text-gray-800">{chunk.content}</p>
                  <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleLearned?.(chunk.id)}
                      className={`text-xs ${
                        chunk.learned
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {chunk.learned ? '✓ Learned' : 'Mark as learned'}
                    </button>
                    <button
                      onClick={() => onDeleteChunk?.(chunk.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary 영역 */}
      <div className="border-t border-gray-200">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Summary</h3>
          {!editingSummary && (
            <button
              onClick={() => setEditingSummary(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        <div className="p-3">
          {editingSummary ? (
            <div className="space-y-2">
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Write a summary of what you learned..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSummaryText(summary)
                    setEditingSummary(false)
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveSummary}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 min-h-[3rem]">
              {summary || (
                <span className="text-gray-400 italic">
                  No summary yet. Click Edit to add one.
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
