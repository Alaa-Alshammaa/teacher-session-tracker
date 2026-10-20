import type { Student } from '../types/student'
import type { Session } from '../types/session'
import { getPackageSizeMinutes, sortSessionsByDateAsc } from './packageSplitting'

export const ALL_PACKAGES = 'all' as const
export type PackageFilter = typeof ALL_PACKAGES | number

export interface PackageSummary {
  packageNumber: number
  packageSize: number
  sessionCount: number
  totalMinutes: number
  totalHours: number
  totalFeesEur: number
  isComplete: boolean
  isActive: boolean
  sessions: Session[]
}

export interface StudentPackageSummary {
  student: Student
  packages: PackageSummary[]
}

export function getAvailablePackageNumbers(sessions: Session[]): number[] {
  const packages = new Set(sessions.map((s) => s.packageNumber))
  return Array.from(packages).sort((a, b) => a - b)
}

export function packageMatchesFilter(packageNumber: number, filter: PackageFilter): boolean {
  if (filter === ALL_PACKAGES) return true
  return packageNumber === filter
}

export function buildPackageSummaries(
  students: Student[],
  sessions: Session[],
  filter: PackageFilter,
): StudentPackageSummary[] {
  const studentById = new Map(students.map((s) => [s.id, s]))

  const byStudentPackage = new Map<string, Map<number, Session[]>>()
  for (const session of sessions) {
    const packages = byStudentPackage.get(session.studentId) ?? new Map<number, Session[]>()
    const list = packages.get(session.packageNumber) ?? []
    list.push(session)
    packages.set(session.packageNumber, list)
    byStudentPackage.set(session.studentId, packages)
  }

  const summaries: StudentPackageSummary[] = []

  for (const [studentId, packageMap] of byStudentPackage) {
    const student = studentById.get(studentId)
    if (!student) continue

    const maxPackageNumber = Math.max(...packageMap.keys())
    const packages = Array.from(packageMap.entries())
      .filter(([packageNumber]) => packageMatchesFilter(packageNumber, filter))
      .sort(([a], [b]) => a - b)
      .map(([packageNumber, packageSessions]) => {
        const sorted = sortSessionsByDateAsc(packageSessions)
        const totalMinutes = sorted.reduce((sum, s) => sum + s.durationMinutes, 0)
        const totalHours = totalMinutes / 60
        const isComplete = totalMinutes >= getPackageSizeMinutes(student.packageSize)

        return {
          packageNumber,
          packageSize: student.packageSize,
          sessionCount: sorted.length,
          totalMinutes,
          totalHours,
          totalFeesEur: totalHours * student.hourlyRateEur,
          isComplete,
          isActive: packageNumber === maxPackageNumber && !isComplete,
          sessions: sorted,
        }
      })

    if (packages.length === 0) continue

    summaries.push({
      student,
      packages,
    })
  }

  return summaries.sort((a, b) => a.student.name.localeCompare(b.student.name))
}

export function getAllPackagesForStudent(
  student: Student,
  sessions: Session[],
): PackageSummary[] {
  return (
    buildPackageSummaries([student], sessions, ALL_PACKAGES).find(
      (summary) => summary.student.id === student.id,
    )?.packages ?? []
  )
}

export function getPackageTotals(summaries: StudentPackageSummary[]) {
  return summaries.reduce(
    (totals, summary) => {
      for (const pkg of summary.packages) {
        totals.totalSessions += pkg.sessionCount
        totals.totalMinutes += pkg.totalMinutes
        totals.totalFees += pkg.totalFeesEur
      }
      return totals
    },
    { totalSessions: 0, totalMinutes: 0, totalFees: 0 },
  )
}
