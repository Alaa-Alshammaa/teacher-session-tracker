import { LogSessionForm } from '../components/sessions/LogSessionForm'
import { useLanguage } from '../context/LanguageContext'
import { useSessions } from '../hooks/useSessions'
import { useStudents } from '../hooks/useStudents'

export function LogSessionPage() {
  const { t } = useLanguage()
  const { students } = useStudents()
  const { logSession } = useSessions()

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{t('logSession.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('logSession.subtitle')}</p>
      </div>

      <LogSessionForm students={students} onSave={logSession} />
    </div>
  )
}
