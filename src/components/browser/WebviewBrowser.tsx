import { useRef, useState, useEffect, useCallback } from 'react'
import Button from '../common/Button'

// Webview 타입 정의
interface WebviewElement extends HTMLElement {
  src: string
  canGoBack(): boolean
  canGoForward(): boolean
  goBack(): void
  goForward(): void
  reload(): void
  executeJavaScript(code: string): Promise<string>
}

interface WebviewBrowserProps {
  onTextSelected?: (text: string) => void
  onSimplifyRequest?: (text: string) => void
  initialUrl?: string
}

export default function WebviewBrowser({
  onTextSelected,
  onSimplifyRequest,
  initialUrl = 'https://www.google.com',
}: WebviewBrowserProps) {
  const webviewRef = useRef<WebviewElement | null>(null)
  const [url, setUrl] = useState(initialUrl)
  const [inputUrl, setInputUrl] = useState(initialUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  // webview 이벤트 설정
  useEffect(() => {
    const webview = webviewRef.current
    if (!webview) return

    const handleLoadStart = () => setIsLoading(true)
    const handleLoadStop = () => {
      setIsLoading(false)
      setCanGoBack(webview.canGoBack())
      setCanGoForward(webview.canGoForward())
    }
    const handleNavigate = (e: Event & { url?: string }) => {
      if (e.url) {
        setUrl(e.url)
        setInputUrl(e.url)
      }
    }

    webview.addEventListener('did-start-loading', handleLoadStart)
    webview.addEventListener('did-stop-loading', handleLoadStop)
    webview.addEventListener('did-navigate', handleNavigate)
    webview.addEventListener('did-navigate-in-page', handleNavigate)

    return () => {
      webview.removeEventListener('did-start-loading', handleLoadStart)
      webview.removeEventListener('did-stop-loading', handleLoadStop)
      webview.removeEventListener('did-navigate', handleNavigate)
      webview.removeEventListener('did-navigate-in-page', handleNavigate)
    }
  }, [])

  // 선택된 텍스트 가져오기
  const getSelectedText = useCallback(async () => {
    const webview = webviewRef.current
    if (!webview) return

    try {
      const selectedText = await webview.executeJavaScript(
        'window.getSelection().toString()'
      )
      if (selectedText && selectedText.trim() && onTextSelected) {
        onTextSelected(selectedText.trim())
      }
    } catch (error) {
      console.error('Failed to get selected text:', error)
    }
  }, [onTextSelected])

  // 선택된 텍스트를 쉬운 영어로 변환 요청
  const handleSimplify = useCallback(async () => {
    const webview = webviewRef.current
    if (!webview || !onSimplifyRequest) return

    try {
      const selectedText = await webview.executeJavaScript(
        'window.getSelection().toString()'
      )
      if (selectedText && selectedText.trim()) {
        onSimplifyRequest(selectedText.trim())
      }
    } catch (error) {
      console.error('Failed to get selected text:', error)
    }
  }, [onSimplifyRequest])

  // 네비게이션 함수들
  const goBack = () => webviewRef.current?.goBack()
  const goForward = () => webviewRef.current?.goForward()
  const reload = () => webviewRef.current?.reload()
  const navigate = (newUrl: string) => {
    let finalUrl = newUrl
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      finalUrl = 'https://' + newUrl
    }
    setUrl(finalUrl)
    setInputUrl(finalUrl)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(inputUrl)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200">
        {/* 네비게이션 버튼 */}
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Back"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Forward"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={reload}
          className="p-2 rounded hover:bg-gray-200"
          title="Reload"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>

        {/* URL 입력 */}
        <form onSubmit={handleSubmit} className="flex-1 flex">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL..."
          />
        </form>

        {/* 버튼들 */}
        {onSimplifyRequest && (
          <Button onClick={handleSimplify} size="sm" variant="secondary">
            Simplify
          </Button>
        )}
        <Button onClick={getSelectedText} size="sm">
          + Add to Notes
        </Button>
      </div>

      {/* Webview */}
      <div className="flex-1 relative">
        <webview
          ref={webviewRef}
          src={url}
          className="absolute inset-0 w-full h-full"
          // @ts-expect-error - webview attributes
          allowpopups="true"
          useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          partition="persist:webview"
          webpreferences="contextIsolation=no, nodeIntegration=no"
        />
      </div>
    </div>
  )
}
