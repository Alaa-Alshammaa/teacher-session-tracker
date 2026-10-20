import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useFormatters } from '../../hooks/useFormatters'
import { toDurationMinutes } from '../../lib/duration'
import {
  getAllPackagesForStudent,
  type StudentPackageSummary,
} from '../../lib/summary'
import {
  getLogicalSessionId,
  getSessionDisplayNote,
  sortSessionsByDateAsc,
} from '../../lib/packageSplitting'
import { getPackagePaymentKey, type PackagePaymentStatuses } from '../../lib/packagePayment'
import type { DurationUnit, Session } from '../../types/session'
import type { UpdateSessionInput } from '../../lib/sessionStorage'
import { ExportExcelButton } from './ExportExcelButton'
import { ShareSummaryPanel } from './ShareSummaryPanel'

interface StudentSummaryCardProps {
  summary: StudentPackageSummary
  allSessions: Session[]
  packagePaymentStatuses: PackagePaymentStatuses
  onTogglePackagePaid: (studentId: string, packageNumber: number, isPaid: boolean) => void
  onUpdateSession: (logicalSessionId: string, input: UpdateSessionInput) => boolean
  onDeleteSession: (logicalSessionId: string) => boolean
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

function formatDurationInput(minutes: number): string {
  const hours = minutes / 60
  return Number.isInteger(hours) ? String(hours) : String(Math.round(hours * 100) / 100)
}

function getEditableSession(session: Session, allSessions: Session[]) {
  const logicalSessionId = getLogicalSessionId(session)
  const sessionParts = sortSessionsByDateAsc(
    allSessions.filter((s) => getLogicalSessionId(s) === logicalSessionId),
  )
  const sourceSession = sessionParts[0] ?? session
  return {
    logicalSessionId,
    durationMinutes: sessionParts.reduce((sum, s) => sum + s.durationMinutes, 0),
    date: sourceSession.date,
    note: sourceSession.note ?? '',
  }
}

export function StudentSummaryCard({
  summary,
  allSessions,
  packagePaymentStatuses,
  onTogglePackagePaid,
  onUpdateSession,
  onDeleteSession,
}: StudentSummaryCardProps) {
  const { t } = useLanguage()
  const {
    formatEur,
    formatDate,
    formatDuration,
    formatHourNumber,
    formatHourNumberFromMinutes,
    formatHoursFromMinutes,
  } = useFormatters()
  const { student, packages } = summary
  const allPackages = getAllPackagesForStudent(student, allSessions)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editUnit, setEditUnit] = useState<DurationUnit>('hours')
  const [editNote, setEditNote] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  function startEdit(session: Session) {
    const editableSession = getEditableSession(session, allSessions)
    setEditingSessionId(editableSession.logicalSessionId)
    setEditDate(editableSession.date)
    setEditDuration(formatDurationInput(editableSession.durationMinutes))
    setEditUnit('hours')
    setEditNote(editableSession.note)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingSessionId(null)
    setEditDate('')
    setEditDuration('')
    setEditUnit('hours')
    setEditNote('')
    setEditError(null)
  }

  function saveEdit(e: FormEvent, logicalSessionId: string) {
    e.preventDefault()
    setEditError(null)

    const amount = parseFloat(editDuration.replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0) {
      setEditError(t('logSession.errorDurationInvalid'))
      return
    }

    const durationMinutes = toDurationMinutes(amount, editUnit)
    if (durationMinutes <= 0) {
      setEditError(t('logSession.errorDurationMin'))
      return
    }

    const sessionDate = editDate.trim()
    if (!sessionDate) {
      setEditError(t('logSession.errorDateRequired'))
      return
    }

    const updated = onUpdateSession(logicalSessionId, {
      durationMinutes,
      date: sessionDate,
      ...(editNote.trim() ? { note: editNote.trim() } : {}),
    })

    if (!updated) {
      setEditError(t('summary.sessionUpdateFailed'))
      return
    }

    cancelEdit()
  }

  function deleteSession(session: Session) {
    const confirmed = window.confirm(t('summary.deleteSessionConfirm'))
    if (!confirmed) return
    const deleted = onDeleteSession(getLogicalSessionId(session))
    if (!deleted) {
      setEditError(t('summary.sessionDeleteFailed'))
    }
  }

  function togglePackagePaid(packageNumber: number, isPaid: boolean) {
    if (!isPaid) {
      const confirmed = window.confirm(t('summary.markPackagePaidConfirm', { number: packageNumber }))
      if (!confirmed) return
    }

    onTogglePackagePaid(student.id, packageNumber, !isPaid)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{student.name}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {t('summary.rate', { rate: formatEur(student.hourlyRateEur) })}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {t('summary.studentPackageSize', { count: formatHourNumber(student.packageSize) })}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:flex-wrap">
        <ExportExcelButton student={student} packages={allPackages} />
      </div>

      <div className="space-y-4 px-5 py-4">
        {packages.map((pkg) => {
          const isPaid =
            packagePaymentStatuses[getPackagePaymentKey(student.id, pkg.packageNumber)] ?? false

          return (
          <article
            key={pkg.packageNumber}
            className={`overflow-hidden rounded-xl border ${
              isPaid ? 'border-green-200 bg-green-50/40' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {t('summary.packageTitle', { number: pkg.packageNumber })}
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  {pkg.isComplete
                    ? t('summary.packageComplete')
                    : t('summary.packageProgress', {
                        count: formatHourNumberFromMinutes(pkg.totalMinutes),
                        size: formatHourNumber(pkg.packageSize),
                      })}
                  {pkg.isActive ? ` · ${t('summary.currentPackage')}` : ''}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => togglePackagePaid(pkg.packageNumber, isPaid)}
                  className={`min-h-11 rounded-lg border px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:min-h-0 sm:px-3 sm:py-1.5 ${
                    isPaid
                      ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 focus:ring-green-500'
                      : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 focus:ring-red-500'
                  }`}
                >
                  {isPaid ? t('summary.packagePaid') : t('summary.packageUnpaid')}
                </button>
                <ExportExcelButton student={student} pkg={pkg} />
              </div>
            </div>

            <div className="grid gap-4 border-b border-slate-100 px-4 py-3 sm:grid-cols-3">
              <Stat label={t('summary.statSessions')} value={String(pkg.sessionCount)} />
              <Stat
                label={t('summary.statTotalHours')}
                value={formatHoursFromMinutes(pkg.totalMinutes)}
              />
              <Stat label={t('summary.statFeesOwed')} value={formatEur(pkg.totalFeesEur)} highlight />
            </div>

            <div className="px-4 py-3">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">
                {t('summary.breakdown')}
              </h4>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                {pkg.sessions.map((session) => {
                  const sessionHours = session.durationMinutes / 60
                  const sessionFee = sessionHours * student.hourlyRateEur
                  const displayNote = getSessionDisplayNote(session)
                  const logicalSessionId = getLogicalSessionId(session)
                  return (
                    <li
                      key={session.id}
                      className="px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {formatDate(session.date)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDuration(session.durationMinutes)}
                            <span className="text-slate-300"> · </span>
                            {formatEur(sessionFee)}
                          </p>
                          {displayNote && (
                            <p className="mt-1 text-sm text-slate-600">{displayNote}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(session)}
                            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                            aria-label={t('summary.editSession')}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSession(session)}
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-sm text-red-700 hover:bg-red-50"
                            aria-label={t('summary.deleteSession')}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {editingSessionId === logicalSessionId && (
                        <form
                          onSubmit={(e) => saveEdit(e, logicalSessionId)}
                          noValidate
                          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="space-y-4">
                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-slate-700">
                                {t('logSession.duration')}
                              </span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={editDuration}
                                  onChange={(e) => setEditDuration(e.target.value)}
                                  className={inputClass}
                                  required
                                  aria-label={t('logSession.srDuration')}
                                />
                                <select
                                  value={editUnit}
                                  onChange={(e) => setEditUnit(e.target.value as DurationUnit)}
                                  className="w-32 shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                  aria-label={t('logSession.srUnit')}
                                >
                                  <option value="hours">{t('logSession.hours')}</option>
                                  <option value="minutes">{t('logSession.minutes')}</option>
                                </select>
                              </div>
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-slate-700">
                                {t('logSession.date')}
                              </span>
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className={inputClass}
                                required
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-sm font-medium text-slate-700">
                                {t('logSession.note')}{' '}
                                <span className="font-normal text-slate-400">
                                  {t('common.optional')}
                                </span>
                              </span>
                              <textarea
                                value={editNote}
                                onChange={(e) => setEditNote(e.target.value)}
                                rows={3}
                                className={inputClass}
                              />
                            </label>
                          </div>

                          {editError && (
                            <p className="mt-4 text-sm text-red-600" role="alert">
                              {editError}
                            </p>
                          )}

                          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <button
                              type="submit"
                              className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:min-h-0 sm:px-3 sm:py-1.5"
                            >
                              {t('common.save')}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="min-h-11 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:min-h-0 sm:px-3 sm:py-1.5"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </form>
                        )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <ShareSummaryPanel student={student} pkg={pkg} />
          </article>
          )
        })}
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${highlight ? 'text-indigo-600' : 'text-slate-900'}`}
      >
        {value}
      </p>
    </div>
  )
}
