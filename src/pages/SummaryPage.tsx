import { useMemo, useState } from 'react'
import { PackageSelector } from '../components/summary/PackageSelector'
import { StudentSummaryCard } from '../components/summary/StudentSummaryCard'
import { useLanguage } from '../context/LanguageContext'
import { useFormatters } from '../hooks/useFormatters'
import {
  ALL_PACKAGES,
  buildPackageSummaries,
  getAvailablePackageNumbers,
  getPackageTotals,
  type PackageFilter,
  type StudentPackageSummary,
} from '../lib/summary'
import { useSessions } from '../hooks/useSessions'
import { useStudents } from '../hooks/useStudents'
import type { UpdateSessionInput } from '../lib/sessionStorage'
import {
  getPackagePaymentKey,
  readPackagePaymentStatuses,
  writePackagePaymentStatus,
} from '../lib/packagePayment'

const ALL_STUDENTS = 'all'
const ALL_MONTHS = 'all'
const SUMMARY_STUDENT_FILTER_KEY = 'tst_summary_student_filter'
const SUMMARY_MONTH_FILTER_KEY = 'tst_summary_month_filter'

function readStoredStudentFilter(): string {
  try {
    return localStorage.getItem(SUMMARY_STUDENT_FILTER_KEY) ?? ALL_STUDENTS
  } catch {
    return ALL_STUDENTS
  }
}

function readStoredMonthFilter(): string {
  try {
    return localStorage.getItem(SUMMARY_MONTH_FILTER_KEY) ?? ALL_MONTHS
  } catch {
    return ALL_MONTHS
  }
}

function getSessionMonth(date: string): string {
  return date.slice(0, 7)
}

export function SummaryPage() {
  const { t } = useLanguage()
  const { formatEur, formatHoursFromMinutes, formatMonthLabel } = useFormatters()
  const { students } = useStudents()
  const { sessions, updateSession, deleteSession } = useSessions()
  const [packageFilter, setPackageFilter] = useState<PackageFilter>(ALL_PACKAGES)
  const [studentFilter, setStudentFilter] = useState(readStoredStudentFilter)
  const [monthFilter, setMonthFilter] = useState(readStoredMonthFilter)
  const [sessionActionMessage, setSessionActionMessage] = useState<string | null>(null)
  const [packagePaymentStatuses, setPackagePaymentStatuses] = useState(readPackagePaymentStatuses)

  function handleStudentFilterChange(studentId: string) {
    setStudentFilter(studentId)
    try {
      localStorage.setItem(SUMMARY_STUDENT_FILTER_KEY, studentId)
    } catch {
      /* ignore */
    }
  }

  function handleMonthFilterChange(month: string) {
    setMonthFilter(month)
    try {
      localStorage.setItem(SUMMARY_MONTH_FILTER_KEY, month)
    } catch {
      /* ignore */
    }
  }

  function handleUpdateSession(logicalSessionId: string, input: UpdateSessionInput): boolean {
    const updated = updateSession(logicalSessionId, input)
    if (updated) {
      setSessionActionMessage(t('summary.sessionUpdated'))
    }
    return updated
  }

  function handleDeleteSession(logicalSessionId: string): boolean {
    const deleted = deleteSession(logicalSessionId)
    if (deleted) {
      setSessionActionMessage(t('summary.sessionDeleted'))
    }
    return deleted
  }

  function handleTogglePackagePaid(studentId: string, packageNumber: number, isPaid: boolean) {
    setPackagePaymentStatuses(writePackagePaymentStatus(studentId, packageNumber, isPaid))
  }

  const availablePackages = useMemo(() => getAvailablePackageNumbers(sessions), [sessions])

  const activeStudentFilter =
    studentFilter === ALL_STUDENTS || students.some((student) => student.id === studentFilter)
      ? studentFilter
      : ALL_STUDENTS

  const filteredStudents = useMemo(() => {
    if (activeStudentFilter === ALL_STUDENTS) return students
    return students.filter((student) => student.id === activeStudentFilter)
  }, [students, activeStudentFilter])

  const filteredStudentIds = useMemo(
    () => new Set(filteredStudents.map((student) => student.id)),
    [filteredStudents],
  )

  const availableMonths = useMemo(() => {
    const months = new Set(
      sessions
        .filter((session) => filteredStudentIds.has(session.studentId))
        .map((session) => getSessionMonth(session.date)),
    )
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [sessions, filteredStudentIds])

  const activeMonthFilter =
    monthFilter === ALL_MONTHS || availableMonths.includes(monthFilter)
      ? monthFilter
      : ALL_MONTHS

  const unfilteredSummaries = useMemo(
    () => buildPackageSummaries(filteredStudents, sessions, packageFilter),
    [filteredStudents, sessions, packageFilter],
  )

  const summaries = useMemo(() => {
    if (activeMonthFilter === ALL_MONTHS) return unfilteredSummaries

    return unfilteredSummaries
      .map<StudentPackageSummary>((summary) => ({
        ...summary,
        packages: summary.packages.filter((pkg) =>
          pkg.sessions.some((session) => getSessionMonth(session.date) === activeMonthFilter),
        ),
      }))
      .filter((summary) => summary.packages.length > 0)
  }, [unfilteredSummaries, activeMonthFilter])

  const totals = useMemo(() => getPackageTotals(summaries), [summaries])

  const paymentTotals = useMemo(
    () =>
      summaries.reduce(
        (acc, summary) => {
          for (const pkg of summary.packages) {
            const key = getPackagePaymentKey(summary.student.id, pkg.packageNumber)
            if (packagePaymentStatuses[key]) {
              acc.paid += pkg.totalFeesEur
            } else {
              acc.unpaid += pkg.totalFeesEur
            }
          }
          return acc
        },
        { paid: 0, unpaid: 0 },
      ),
    [summaries, packagePaymentStatuses],
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{t('summary.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('summary.subtitle')}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="block sm:inline-flex sm:items-center sm:gap-2">
            <span className="mb-1 block text-sm font-medium text-slate-700 sm:mb-0">
              {t('summary.studentFilter')}
            </span>
            <select
              value={activeStudentFilter}
              onChange={(e) => handleStudentFilterChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
            >
              <option value={ALL_STUDENTS}>{t('summary.allStudents')}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:inline-flex sm:items-center sm:gap-2">
            <span className="mb-1 block text-sm font-medium text-slate-700 sm:mb-0">
              {t('summary.month')}
            </span>
            <select
              value={activeMonthFilter}
              onChange={(e) => handleMonthFilterChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
            >
              <option value={ALL_MONTHS}>{t('summary.allMonths')}</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </label>
          <PackageSelector
            value={packageFilter}
            availablePackages={availablePackages}
            onChange={setPackageFilter}
          />
        </div>
      </div>

      {sessionActionMessage && (
        <p
          className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-700"
          role="status"
        >
          {sessionActionMessage}
        </p>
      )}

      {summaries.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              {t('summary.overall')}{' '}
              {packageFilter === ALL_PACKAGES ? `(${t('summary.allPackages')})` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-indigo-900">
              <span>{t('summary.sessionsCount', { count: totals.totalSessions })}</span>
              <span>
                {t('summary.totalHours', {
                  hours: formatHoursFromMinutes(totals.totalMinutes),
                })}
              </span>
              <span>
                {t('summary.feesOwed', { amount: formatEur(totals.totalFees) })}
              </span>
              <div className="basis-full space-y-0.5">
                <p className="font-semibold text-green-700">
                  {t('summary.totalPaid', { amount: formatEur(paymentTotals.paid) })}
                </p>
                <p className="font-semibold text-red-700">
                  {t('summary.totalUnpaid', { amount: formatEur(paymentTotals.unpaid) })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
          <p className="text-sm text-slate-500">
            {sessions.length === 0
              ? t('summary.emptyNoSessions')
              : t('summary.emptyNoPackage')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary) => (
            <StudentSummaryCard
              key={summary.student.id}
              summary={summary}
              allSessions={sessions}
              packagePaymentStatuses={packagePaymentStatuses}
              onTogglePackagePaid={handleTogglePackagePaid}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
            />
          ))}
        </div>
      )}
    </div>
  )
}
