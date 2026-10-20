import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LogSessionPage } from './pages/LogSessionPage'
import { SettingsPage } from './pages/SettingsPage'
import { StudentsPage } from './pages/StudentsPage'
import { SummaryPage } from './pages/SummaryPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/students" replace />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="log-session" element={<LogSessionPage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
