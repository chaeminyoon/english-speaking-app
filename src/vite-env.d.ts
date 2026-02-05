/// <reference types="vite/client" />

// Electron webview 타입
declare namespace Electron {
  interface WebviewTag extends HTMLElement {
    src: string
    canGoBack(): boolean
    canGoForward(): boolean
    goBack(): void
    goForward(): void
    reload(): void
    stop(): void
    loadURL(url: string): Promise<void>
    executeJavaScript(code: string): Promise<unknown>
    addEventListener(type: string, listener: (event: Event) => void): void
    removeEventListener(type: string, listener: (event: Event) => void): void
  }

  interface DidNavigateEvent extends Event {
    url: string
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<Electron.WebviewTag> & {
          src?: string
          allowpopups?: string
          preload?: string
        },
        Electron.WebviewTag
      >
    }
  }
}

export {}
