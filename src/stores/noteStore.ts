import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CornellNote, NoteChunk } from '../types'

interface NoteState {
  notes: CornellNote[]
  currentNote: CornellNote | null

  // 노트 관리
  createNote: (topicId: string, title: string, sourceUrl?: string) => CornellNote
  updateNote: (id: string, updates: Partial<CornellNote>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (note: CornellNote | null) => void
  getNotesByTopic: (topicId: string) => CornellNote[]

  // Chunk 관리
  addChunk: (noteId: string, content: string, keyword?: string) => void
  updateChunk: (noteId: string, chunkId: string, updates: Partial<NoteChunk>) => void
  deleteChunk: (noteId: string, chunkId: string) => void
  toggleChunkLearned: (noteId: string, chunkId: string) => void

  // 요약 관리
  updateSummary: (noteId: string, summary: string) => void
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,

      createNote: (topicId, title, sourceUrl) => {
        const newNote: CornellNote = {
          id: crypto.randomUUID(),
          topicId,
          title,
          chunks: [],
          sourceUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          notes: [...state.notes, newNote],
          currentNote: newNote,
        }))
        return newNote
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
          currentNote:
            state.currentNote?.id === id
              ? { ...state.currentNote, ...updates, updatedAt: new Date() }
              : state.currentNote,
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        }))
      },

      setCurrentNote: (note) => {
        set({ currentNote: note })
      },

      getNotesByTopic: (topicId) => {
        return get().notes.filter((note) => note.topicId === topicId)
      },

      addChunk: (noteId, content, keyword) => {
        const newChunk: NoteChunk = {
          id: crypto.randomUUID(),
          topicId: get().notes.find((n) => n.id === noteId)?.topicId || '',
          content,
          keyword,
          learned: false,
          createdAt: new Date(),
        }
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  chunks: [...note.chunks, newChunk],
                  updatedAt: new Date(),
                }
              : note
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  chunks: [...state.currentNote.chunks, newChunk],
                  updatedAt: new Date(),
                }
              : state.currentNote,
        }))
      },

      updateChunk: (noteId, chunkId, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  chunks: note.chunks.map((chunk) =>
                    chunk.id === chunkId ? { ...chunk, ...updates } : chunk
                  ),
                  updatedAt: new Date(),
                }
              : note
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  chunks: state.currentNote.chunks.map((chunk) =>
                    chunk.id === chunkId ? { ...chunk, ...updates } : chunk
                  ),
                  updatedAt: new Date(),
                }
              : state.currentNote,
        }))
      },

      deleteChunk: (noteId, chunkId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  chunks: note.chunks.filter((chunk) => chunk.id !== chunkId),
                  updatedAt: new Date(),
                }
              : note
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  chunks: state.currentNote.chunks.filter(
                    (chunk) => chunk.id !== chunkId
                  ),
                  updatedAt: new Date(),
                }
              : state.currentNote,
        }))
      },

      toggleChunkLearned: (noteId, chunkId) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  chunks: note.chunks.map((chunk) =>
                    chunk.id === chunkId
                      ? { ...chunk, learned: !chunk.learned }
                      : chunk
                  ),
                  updatedAt: new Date(),
                }
              : note
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? {
                  ...state.currentNote,
                  chunks: state.currentNote.chunks.map((chunk) =>
                    chunk.id === chunkId
                      ? { ...chunk, learned: !chunk.learned }
                      : chunk
                  ),
                  updatedAt: new Date(),
                }
              : state.currentNote,
        }))
      },

      updateSummary: (noteId, summary) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, summary, updatedAt: new Date() }
              : note
          ),
          currentNote:
            state.currentNote?.id === noteId
              ? { ...state.currentNote, summary, updatedAt: new Date() }
              : state.currentNote,
        }))
      },
    }),
    {
      name: 'note-storage',
    }
  )
)
