import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore, AI_MODELS } from '../stores/settingsStore'
import { AIProvider } from '../types'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function SettingsPage() {
  const navigate = useNavigate()
  const {
    aiProvider,
    openaiApiKey,
    claudeApiKey,
    geminiApiKey,
    ollamaBaseUrl,
    selectedModel,
    setAiProvider,
    setOpenAIApiKey,
    setClaudeApiKey,
    setGeminiApiKey,
    setOllamaBaseUrl,
    setSelectedModel,
  } = useSettingsStore()

  const [openaiInput, setOpenaiInput] = useState(openaiApiKey || '')
  const [claudeInput, setClaudeInput] = useState(claudeApiKey || '')
  const [geminiInput, setGeminiInput] = useState(geminiApiKey || '')
  const [ollamaInput, setOllamaInput] = useState(ollamaBaseUrl || 'http://localhost:11434')
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<string | null>(null)

  const handleSave = (provider: string, saveFunc: (key: string) => void, value: string) => {
    if (value.trim()) {
      saveFunc(value.trim())
      setSaved(provider)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const providerOptions: { id: AIProvider; name: string; description: string }[] = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4o, GPT-4, GPT-3.5 (Speech-to-text 필수)' },
    { id: 'claude', name: 'Claude', description: 'Anthropic의 Claude 모델' },
    { id: 'gemini', name: 'Gemini', description: 'Google의 Gemini (무료 tier 제공)' },
    { id: 'ollama', name: 'Ollama', description: '로컬 LLM (무료, 인터넷 불필요)' },
  ]

  const currentModels = AI_MODELS[aiProvider] || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* AI Provider 선택 */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Provider</h2>
          <div className="grid grid-cols-2 gap-3">
            {providerOptions.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setAiProvider(provider.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${aiProvider === provider.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium text-gray-900">{provider.name}</div>
                <div className="text-xs text-gray-500 mt-1">{provider.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* 모델 선택 */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Selection</h2>
          <select
            value={selectedModel || currentModels[0]?.id || ''}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currentModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </Card>

        {/* OpenAI API Key */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">OpenAI API Key</h2>
          <p className="text-sm text-gray-500 mb-4">
            {aiProvider === 'openai' ? '현재 선택된 Provider' : 'Speech-to-text 기능에 필요 (다른 Provider 사용 시에도)'}
          </p>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={openaiInput}
                onChange={(e) => setOpenaiInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('openai')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showKeys.openai ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => handleSave('openai', setOpenAIApiKey, openaiInput)}
                disabled={!openaiInput.trim()}
                size="sm"
              >
                {saved === 'openai' ? '✓ Saved!' : 'Save'}
              </Button>
              {openaiApiKey && <span className="text-sm text-green-600">✓ Configured</span>}
            </div>
          </div>
        </Card>

        {/* Claude API Key */}
        {aiProvider === 'claude' && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Claude API Key</h2>
            <p className="text-sm text-gray-500 mb-4">Anthropic API key from console.anthropic.com</p>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKeys.claude ? 'text' : 'password'}
                  value={claudeInput}
                  onChange={(e) => setClaudeInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('claude')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showKeys.claude ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => handleSave('claude', setClaudeApiKey, claudeInput)}
                  disabled={!claudeInput.trim()}
                  size="sm"
                >
                  {saved === 'claude' ? '✓ Saved!' : 'Save'}
                </Button>
                {claudeApiKey && <span className="text-sm text-green-600">✓ Configured</span>}
              </div>
            </div>
          </Card>
        )}

        {/* Gemini API Key */}
        {aiProvider === 'gemini' && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Gemini API Key</h2>
            <p className="text-sm text-gray-500 mb-4">
              Google AI Studio에서 무료로 발급:{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                aistudio.google.com
              </a>
            </p>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKeys.gemini ? 'text' : 'password'}
                  value={geminiInput}
                  onChange={(e) => setGeminiInput(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('gemini')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showKeys.gemini ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => handleSave('gemini', setGeminiApiKey, geminiInput)}
                  disabled={!geminiInput.trim()}
                  size="sm"
                >
                  {saved === 'gemini' ? '✓ Saved!' : 'Save'}
                </Button>
                {geminiApiKey && <span className="text-sm text-green-600">✓ Configured</span>}
              </div>
            </div>
          </Card>
        )}

        {/* Ollama Settings */}
        {aiProvider === 'ollama' && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Ollama Server</h2>
            <p className="text-sm text-gray-500 mb-4">
              로컬에서 Ollama 실행 필요:{' '}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ollama.com
              </a>
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={ollamaInput}
                onChange={(e) => setOllamaInput(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => handleSave('ollama', setOllamaBaseUrl, ollamaInput)}
                disabled={!ollamaInput.trim()}
                size="sm"
              >
                {saved === 'ollama' ? '✓ Saved!' : 'Save'}
              </Button>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Ollama 사용 시에도 Speech-to-text는 OpenAI API key가 필요합니다.
              </p>
            </div>
          </Card>
        )}

        {/* 도움말 */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Key 발급 가이드</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <div>
              <strong>OpenAI:</strong>{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com
              </a>
            </div>
            <div>
              <strong>Claude:</strong>{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                console.anthropic.com
              </a>
            </div>
            <div>
              <strong>Gemini:</strong>{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                aistudio.google.com
              </a>{' '}
              (무료 tier 제공!)
            </div>
            <div>
              <strong>Ollama:</strong>{' '}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ollama.com
              </a>{' '}
              (완전 무료, 로컬 실행)
            </div>
          </div>
        </Card>

        {/* 앱 정보 */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>English Speaking Practice App v1.0.0</p>
          <p className="mt-1">Built with Electron + React</p>
        </div>
      </main>
    </div>
  )
}
