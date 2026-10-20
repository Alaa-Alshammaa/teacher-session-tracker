import { useState, type FormEvent } from 'react'
import { useLanguage } from '../../context/LanguageContext'

interface AddStudentFormProps {
  onAdd: (name: string, hourlyRateEur: number) => void
}

export function AddStudentForm({ onAdd }: AddStudentFormProps) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const hourlyRate = parseFloat(rate.replace(',', '.'))

    if (!trimmedName) {
      setError(t('students.errorNameRequired'))
      return
    }
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      setError(t('students.errorRateInvalid'))
      return
    }

    onAdd(trimmedName, Math.round(hourlyRate * 100) / 100)
    setName('')
    setRate('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-base font-semibold text-slate-900">{t('students.addTitle')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('students.name')}</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('students.namePlaceholder')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {t('students.hourlyRate')}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder={t('students.ratePlaceholder')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="mt-4 min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto sm:py-2"
      >
        {t('students.addButton')}
      </button>
    </form>
  )
}
