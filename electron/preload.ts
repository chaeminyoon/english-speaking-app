import { contextBridge, ipcRenderer } from 'electron'

// 렌더러 프로세스에 노출할 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 선택한 텍스트 가져오기
  getSelectedText: () => ipcRenderer.invoke('get-selected-text'),

  // 설정 저장/불러오기
  saveSettings: (settings: Record<string, unknown>) =>
    ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),

  // 노트 데이터 저장/불러오기
  saveNote: (note: Record<string, unknown>) =>
    ipcRenderer.invoke('save-note', note),
  loadNotes: (topicId: string) =>
    ipcRenderer.invoke('load-notes', topicId),

  // 플랫폼 정보
  platform: process.platform,
})

// TypeScript 타입 정의
declare global {
  interface Window {
    electronAPI: {
      getSelectedText: () => Promise<string>
      saveSettings: (settings: Record<string, unknown>) => Promise<void>
      loadSettings: () => Promise<Record<string, unknown>>
      saveNote: (note: Record<string, unknown>) => Promise<void>
      loadNotes: (topicId: string) => Promise<Record<string, unknown>[]>
      platform: string
    }
  }
}
