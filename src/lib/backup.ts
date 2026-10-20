import type { Session } from '../types/session'
import type { Student } from '../types/student'
import {
  readPackagePaymentStatuses,
  writePackagePaymentStatuses,
  type PackagePaymentStatuses,
} from './packagePayment'
import { STORAGE_KEYS } from './storageKeys'

export const LAST_BACKUP_KEY = 'tst_last_backup_at'

interface BackupData {
  exportedAt: string
  schemaVersion: string | null
  students: Student[]
  sessions: Session[]
  packagePaymentStatuses: PackagePaymentStatuses
}

function readStoredArray<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Stored data is invalid.')
  }
  return parsed as T[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStudent(value: unknown): value is Student {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.hourlyRateEur === 'number' &&
    Number.isFinite(value.hourlyRateEur) &&
    typeof value.packageSize === 'number' &&
    Number.isFinite(value.packageSize) &&
    value.packageSize > 0 &&
    typeof value.createdAt === 'string'
  )
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.studentId === 'string' &&
    typeof value.packageNumber === 'number' &&
    Number.isInteger(value.packageNumber) &&
    value.packageNumber > 0 &&
    typeof value.durationMinutes === 'number' &&
    Number.isFinite(value.durationMinutes) &&
    value.durationMinutes > 0 &&
    typeof value.date === 'string' &&
    typeof value.createdAt === 'string' &&
    (value.note === undefined || typeof value.note === 'string') &&
    (value.splitGroupId === undefined || typeof value.splitGroupId === 'string') &&
    (value.splitPart === undefined ||
      (typeof value.splitPart === 'number' &&
        Number.isInteger(value.splitPart) &&
        value.splitPart > 0)) &&
    (value.splitPartCount === undefined ||
      (typeof value.splitPartCount === 'number' &&
        Number.isInteger(value.splitPartCount) &&
        value.splitPartCount > 1))
  )
}

function isPackagePaymentStatuses(value: unknown): value is PackagePaymentStatuses {
  if (!isRecord(value) || Array.isArray(value)) return false
  return Object.entries(value).every(
    ([key, paid]) => typeof key === 'string' && typeof paid === 'boolean',
  )
}

function parseBackup(value: unknown): BackupData {
  if (!isRecord(value) || !Array.isArray(value.students) || !Array.isArray(value.sessions)) {
    throw new Error('Backup file must contain students and sessions.')
  }
  const packagePaymentStatuses = value.packagePaymentStatuses

  if (!value.students.every(isStudent)) {
    throw new Error('Backup file contains invalid student data.')
  }

  if (!value.sessions.every(isSession)) {
    throw new Error('Backup file contains invalid session data.')
  }

  if (
    packagePaymentStatuses !== undefined &&
    !isPackagePaymentStatuses(packagePaymentStatuses)
  ) {
    throw new Error('Backup file contains invalid payment status data.')
  }

  return {
    exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : new Date().toISOString(),
    schemaVersion: typeof value.schemaVersion === 'string' ? value.schemaVersion : null,
    students: value.students,
    sessions: value.sessions,
    packagePaymentStatuses: packagePaymentStatuses ?? {},
  }
}

export function getLastBackupAt(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY)
}

export function getBackupFilename(date = new Date()): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `backup-${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}.json`
}

export function exportBackup(): string {
  const now = new Date().toISOString()
  const backup: BackupData = {
    exportedAt: now,
    schemaVersion: localStorage.getItem(STORAGE_KEYS.schemaVersion),
    students: readStoredArray<Student>(STORAGE_KEYS.students),
    sessions: readStoredArray<Session>(STORAGE_KEYS.sessions),
    packagePaymentStatuses: readPackagePaymentStatuses(),
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = getBackupFilename(new Date(now))
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  localStorage.setItem(LAST_BACKUP_KEY, now)
  return now
}

export async function importBackup(file: File): Promise<void> {
  const parsed = parseBackup(JSON.parse(await file.text()) as unknown)
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(parsed.students))
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(parsed.sessions))
  writePackagePaymentStatuses(parsed.packagePaymentStatuses)
  if (parsed.schemaVersion) {
    localStorage.setItem(STORAGE_KEYS.schemaVersion, parsed.schemaVersion)
  } else {
    localStorage.removeItem(STORAGE_KEYS.schemaVersion)
  }
}
