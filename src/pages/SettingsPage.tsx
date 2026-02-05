import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../stores/settingsStore'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { openaiApiKey, setApiKey, clearApiKey } = useSettingsStore()

  const [apiKeyInput, setApiKeyInput] = useState(openaiApiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleClearApiKey = () => {
    if (confirm('Are you sure you want to remove the API key?')) {
      clearApiKey()
      setApiKeyInput('')
    }
  }

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
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* OpenAI API 설정 */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            OpenAI API Key
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter your OpenAI API key to enable AI features like speech-to-text
            and feedback generation.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} disabled={!apiKeyInput.trim()}>
                {saved ? '✓ Saved!' : 'Save API Key'}
              </Button>
              {openaiApiKey && (
                <Button variant="danger" onClick={handleClearApiKey}>
                  Remove
                </Button>
              )}
            </div>

            {openaiApiKey && (
              <p className="text-sm text-green-600">
                ✓ API key is configured
              </p>
            )}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> Your API key is stored locally on your
              device and is never sent to any server except OpenAI.
            </p>
          </div>
        </Card>

        {/* 도움말 */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            How to Get an OpenAI API Key
          </h2>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>
              Go to{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </li>
            <li>Sign in or create an account</li>
            <li>Click "Create new secret key"</li>
            <li>Copy the key and paste it above</li>
          </ol>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Warning:</strong> Keep your API key secure. Using the
              API will incur charges based on your usage.
            </p>
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
