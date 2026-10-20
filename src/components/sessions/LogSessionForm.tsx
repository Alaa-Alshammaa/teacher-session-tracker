import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { toDurationMinutes, todayDateString } from '../../lib/duration'
import type { LoggedSessionResult, NewSessionInput } from '../../lib/sessionStorage'
import type { Student } from '../../types/student'
import type { DurationUnit } from '../../types/session'

interface LogSessionFormProps {
  students: Student[]
  onSave: (input: NewSessionInput) => LoggedSessionResult
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export function LogSessionForm({ students, onSave }: LogSessionFormProps) {
  const { t } = useLanguage()
  const [studentId, setStudentId] = useState('')
  const [duration, setDuration] = useState('')
  const [unit, setUnit] = useState<DurationUnit>('hours')
  const [date, setDate] = useState(todayDateString())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!studentId) {
      setError(t('logSession.errorSelectStudent'))
      return
    }

    const amount = parseFloat(duration.replace(',', '.'))
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t('logSession.errorDurationInvalid'))
      return
    }

    const durationMinutes = toDurationMinutes(amount, unit)
    if (durationMinutes <= 0) {
      setError(t('logSession.errorDurationMin'))
      return
    }

    const sessionDate = date.trim()
    if (!sessionDate) {
      setError(t('logSession.errorDateRequired'))
      return
    }

    const trimmedNote = note.trim()

    const result = onSave({
      studentId,
      durationMinutes,
      date: sessionDate,
      ...(trimmedNote ? { note: trimmedNote } : {}),
    })

    const student = students.find((s) => s.id === studentId)
    const success = t('logSession.success', {
      name: student?.name ?? t('logSession.fallbackStudent'),
    })
    setSuccess(
      result.packageComplete
        ? `${success} ${t('logSession.packageComplete')}`
        : success,
    )
    setDuration('')
    setDate(todayDateString())
    setNote('')
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
        <p className="text-sm text-slate-500">{t('logSession.noStudents')}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t('logSession.student')}
          </span>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">{t('logSession.selectStudent')}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t('logSession.duration')}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={
                unit === 'hours'
                  ? t('logSession.durationPlaceholderHours')
                  : t('logSession.durationPlaceholderMinutes')
              }
              className={inputClass}
              required
              aria-label={t('logSession.srDuration')}
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as DurationUnit)}
              className="w-32 shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label={t('logSession.srUnit')}
            >
              <option value="hours">{t('logSession.hours')}</option>
              <option value="minutes">{t('logSession.minutes')}</option>
            </select>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t('logSession.date')}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
          <p className="mt-1 text-xs text-slate-400">{t('logSession.dateHint')}</p>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t('logSession.note')}{' '}
            <span className="font-normal text-slate-400">{t('common.optional')}</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('logSession.notePlaceholder')}
            className={inputClass}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 text-sm text-green-700" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        className="mt-5 min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:py-2"
      >
        {t('logSession.save')}
      </button>
    </form>
  )
}
