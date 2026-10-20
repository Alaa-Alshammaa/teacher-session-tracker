import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { useFormatters } from '../../hooks/useFormatters'
import type { Student } from '../../types/student'

interface StudentListProps {
  students: Student[]
  onUpdateRate: (id: string, hourlyRateEur: number) => void
  onUpdatePackageSize: (id: string, packageSize: number) => void
  onDelete: (id: string) => void
}

export function StudentList({
  students,
  onUpdateRate,
  onUpdatePackageSize,
  onDelete,
}: StudentListProps) {
  const { t } = useLanguage()
  const { formatEur, formatHourNumber } = useFormatters()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPackageSizeId, setEditingPackageSizeId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState('')
  const [editPackageSize, setEditPackageSize] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [packageSizeError, setPackageSizeError] = useState<string | null>(null)

  function startEdit(student: Student) {
    setEditingId(student.id)
    setEditRate(String(student.hourlyRateEur))
    setEditError(null)
  }

  function startPackageSizeEdit(student: Student) {
    setEditingPackageSizeId(student.id)
    setEditPackageSize(String(student.packageSize))
    setPackageSizeError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditRate('')
    setEditError(null)
  }

  function cancelPackageSizeEdit() {
    setEditingPackageSizeId(null)
    setEditPackageSize('')
    setPackageSizeError(null)
  }

  function saveEdit(id: string) {
    const hourlyRate = parseFloat(editRate.replace(',', '.'))
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      setEditError(t('students.errorEditRateInvalid'))
      return
    }
    onUpdateRate(id, Math.round(hourlyRate * 100) / 100)
    cancelEdit()
  }

  function savePackageSize(id: string) {
    const packageSize = Number.parseFloat(editPackageSize.replace(',', '.'))
    if (!Number.isFinite(packageSize) || packageSize <= 0) {
      setPackageSizeError(t('students.errorPackageSizeInvalid'))
      return
    }
    onUpdatePackageSize(id, Math.round(packageSize * 100) / 100)
    cancelPackageSizeEdit()
  }

  function handleDelete(student: Student) {
    const confirmed = window.confirm(t('students.deleteConfirm', { name: student.name }))
    if (confirmed) onDelete(student.id)
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
        <p className="text-sm text-slate-500">{t('students.listEmpty')}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {t('students.listTitle', { count: students.length })}
        </h2>
      </div>
      <ul className="divide-y divide-slate-100">
        {students.map((student) => (
          <li
            key={student.id}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-slate-900">{student.name}</p>
              {editingId !== student.id && (
                <p className="mt-0.5 text-sm text-slate-500">
                  {t('students.ratePerHour', { rate: formatEur(student.hourlyRateEur) })}
                </p>
              )}
              {editingPackageSizeId === student.id ? (
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <label className="block">
                    <span className="sr-only">{t('students.srPackageSize')}</span>
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={editPackageSize}
                      onChange={(e) => setEditPackageSize(e.target.value)}
                      className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      aria-label={t('students.srPackageSize')}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => savePackageSize(student.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={cancelPackageSizeEdit}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {t('common.cancel')}
                  </button>
                  {packageSizeError && (
                    <p className="w-full text-sm text-red-600" role="alert">
                      {packageSizeError}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-0.5 text-sm text-slate-500">
                  {t('students.sessionsPerPackage', {
                    count: formatHourNumber(student.packageSize),
                  })}
                </p>
              )}
            </div>

            {editingId === student.id ? (
              <div className="flex flex-wrap items-end gap-2">
                <label className="block">
                  <span className="sr-only">{t('students.srHourlyRate')}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    aria-label={t('students.srHourlyRate')}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => saveEdit(student.id)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                {editError && (
                  <p className="w-full text-sm text-red-600" role="alert">
                    {editError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => startEdit(student)}
                  className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:min-h-0 sm:flex-none sm:px-3 sm:py-1.5"
                >
                  {t('students.editRate')}
                </button>
                <button
                  type="button"
                  onClick={() => startPackageSizeEdit(student)}
                  className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:min-h-0 sm:flex-none sm:px-3 sm:py-1.5"
                >
                  {t('students.editPackageSize')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(student)}
                  className="min-h-11 flex-1 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 sm:min-h-0 sm:flex-none sm:px-3 sm:py-1.5"
                >
                  {t('common.delete')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
