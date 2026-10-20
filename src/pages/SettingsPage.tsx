import { useRef, useState, type ChangeEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { exportBackup, getLastBackupAt, importBackup } from '../lib/backup'
import { getIntlLocale } from '../i18n'

const STALE_BACKUP_DAYS = 7

function daysSince(dateIso: string): number {
  const elapsedMs = Date.now() - new Date(dateIso).getTime()
  return Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)))
}

export function SettingsPage() {
  const { t, language } = useLanguage()
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(() => getLastBackupAt())
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const lastBackupDays = lastBackupAt ? daysSince(lastBackupAt) : null
  const showBackupWarning = lastBackupDays === null || lastBackupDays > STALE_BACKUP_DAYS
  const formattedLastBackup = lastBackupAt
    ? new Intl.DateTimeFormat(getIntlLocale(language), {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(lastBackupAt))
    : t('settings.neverBackedUp')

  function handleExportBackup() {
    setError(null)
    setStatus(null)
    try {
      const backupAt = exportBackup()
      setLastBackupAt(backupAt)
      setStatus(t('settings.exportSuccess'))
    } catch {
      setError(t('settings.exportError'))
    }
  }

  async function handleImportBackup(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const confirmed = window.confirm(t('settings.importConfirm'))
    if (!confirmed) return

    setError(null)
    setStatus(null)
    try {
      await importBackup(file)
      setStatus(t('settings.importSuccess'))
    } catch {
      setError(t('settings.importError'))
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('settings.subtitle')}</p>
      </div>

      {showBackupWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
          {lastBackupDays === null
            ? t('settings.noBackupWarning')
            : t('settings.backupWarning', { days: lastBackupDays })}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t('settings.backupTitle')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('settings.backupDescription')}</p>
        <p className="mt-4 text-sm text-slate-600">
          {t('settings.lastBackup', { date: formattedLastBackup })}
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleExportBackup}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:py-2"
          >
            {t('settings.exportBackup')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-11 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:py-2"
          >
            {t('settings.importBackup')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportBackup}
            className="hidden"
          />
        </div>

        {status && (
          <p className="mt-4 text-sm text-green-700" role="status">
            {status}
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  )
}
