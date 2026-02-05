import { app, BrowserWindow, ipcMain, session, systemPreferences } from 'electron'
import path from 'path'

// app.isPackaged is false when running with electron ., true when running packaged app
const isDev = !app.isPackaged

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // webview 태그 활성화
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // webview에서 선택한 텍스트 가져오기 IPC 핸들러
  ipcMain.handle('get-selected-text', async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      const selectedText = await focusedWindow.webContents.executeJavaScript(
        'window.getSelection().toString()'
      )
      return selectedText
    }
    return ''
  })
}

// 미디어 권한 요청 처리
function setupMediaPermissions() {
  // 마이크/카메라 권한 자동 허용
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'geolocation', 'notifications', 'fullscreen']
    if (allowedPermissions.includes(permission)) {
      callback(true)
    } else {
      callback(false)
    }
  })

  // 미디어 디바이스 권한 체크 핸들러
  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    const allowedPermissions = ['media', 'mediaKeySystem', 'geolocation', 'notifications', 'fullscreen']
    return allowedPermissions.includes(permission)
  })
}

// macOS 마이크 권한 요청
async function requestMicrophoneAccess() {
  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('microphone')
    if (status !== 'granted') {
      const granted = await systemPreferences.askForMediaAccess('microphone')
      console.log('Microphone access:', granted ? 'granted' : 'denied')
    }
  }
}

app.whenReady().then(async () => {
  // 미디어 권한 설정
  setupMediaPermissions()

  // macOS 마이크 권한 요청
  await requestMicrophoneAccess()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
