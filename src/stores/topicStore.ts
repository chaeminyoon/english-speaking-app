import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Topic } from '../types'

interface TopicState {
  topics: Topic[]
  currentTopic: Topic | null
  addTopic: (title: string, description?: string) => Topic
  updateTopic: (id: string, updates: Partial<Topic>) => void
  deleteTopic: (id: string) => void
  setCurrentTopic: (topic: Topic | null) => void
  incrementPracticeCount: (id: string) => void
}

export const useTopicStore = create<TopicState>()(
  persist(
    (set, get) => ({
      topics: [],
      currentTopic: null,

      addTopic: (title, description) => {
        const newTopic: Topic = {
          id: crypto.randomUUID(),
          title,
          description,
          createdAt: new Date(),
          updatedAt: new Date(),
          practiceCount: 0,
        }
        set((state) => ({
          topics: [...state.topics, newTopic],
        }))
        return newTopic
      },

      updateTopic: (id, updates) => {
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === id
              ? { ...topic, ...updates, updatedAt: new Date() }
              : topic
          ),
        }))
      },

      deleteTopic: (id) => {
        set((state) => ({
          topics: state.topics.filter((topic) => topic.id !== id),
          currentTopic:
            state.currentTopic?.id === id ? null : state.currentTopic,
        }))
      },

      setCurrentTopic: (topic) => {
        set({ currentTopic: topic })
      },

      incrementPracticeCount: (id) => {
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === id
              ? {
                  ...topic,
                  practiceCount: topic.practiceCount + 1,
                  updatedAt: new Date(),
                }
              : topic
          ),
        }))
      },
    }),
    {
      name: 'topic-storage',
    }
  )
)
