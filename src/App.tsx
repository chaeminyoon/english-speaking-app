import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import SpeechPage from './pages/SpeechPage'
import InputPage from './pages/InputPage'
import LearningPage from './pages/LearningPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topic/:id" element={<TopicPage />} />
        <Route path="/speech/:topicId" element={<SpeechPage />} />
        <Route path="/input/:topicId" element={<InputPage />} />
        <Route path="/learning/:topicId" element={<LearningPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App
