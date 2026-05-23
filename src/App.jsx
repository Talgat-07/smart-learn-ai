import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import Directions from './pages/Directions/Directions'
import LearningPlan from './pages/LearningPlan/LearningPlan'
import TopicLesson from './pages/TopicLesson/TopicLesson'
import Tasks from './pages/Tasks/Tasks'
import AiAssistant from './pages/AiAssistant/AiAssistant'
import Calendar from './pages/Calendar/Calendar'
import Profile from './pages/Profile/Profile'
import NotFound from './pages/NotFound/NotFound'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='directions' element={<Directions />} />
        <Route path='plan' element={<LearningPlan />} />
        <Route path='plan/:directionId' element={<LearningPlan />} />
        <Route path='plan/:directionId/topic/:topicId' element={<TopicLesson />} />
        <Route path='tasks' element={<Tasks />} />
        <Route path='ai-assistant' element={<AiAssistant />} />
        <Route path='calendar' element={<Calendar />} />
        <Route path='profile' element={<Profile />} />
        <Route path='*' element={<NotFound />} />
      </Route>
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
