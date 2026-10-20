import { DEFAULT_PACKAGE_SIZE, type Student } from '../types/student'
import type { Session } from '../types/session'
import { regroupSessionsByPackageHours } from './packageSplitting'
import { STORAGE_KEYS } from './storageKeys'

const CURRENT_SCHEMA_VERSION = '4'

function parseArray(raw: string | null): unknown[] {
  if (!raw) return []
  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error('Stored data is not an array')
  }
  return parsed
}

function normalizeStudent(value: unknown): Student | null {
  if (typeof value !== 'object' || value === null) return null
  const s = value as Record<string, unknown>
  if (
    typeof s.id !== 'string' ||
    typeof s.name !== 'string' ||
    typeof s.hourlyRateEur !== 'number' ||
    !Number.isFinite(s.hourlyRateEur) ||
    typeof s.createdAt !== 'string'
  ) {
    return null
  }

  const packageSize =
    typeof s.packageSize === 'number' &&
    Number.isFinite(s.packageSize) &&
    s.packageSize > 0
      ? s.packageSize
      : DEFAULT_PACKAGE_SIZE

  return {
    id: s.id,
    name: s.name,
    hourlyRateEur: s.hourlyRateEur,
    packageSize,
    createdAt: s.createdAt,
  }
}

function normalizeSession(value: unknown): Session | null {
  if (typeof value !== 'object' || value === null) return null
  const s = value as Record<string, unknown>
  if (
    typeof s.id !== 'string' ||
    typeof s.studentId !== 'string' ||
    typeof s.durationMinutes !== 'number' ||
    !Number.isFinite(s.durationMinutes) ||
    s.durationMinutes <= 0 ||
    typeof s.date !== 'string' ||
    typeof s.createdAt !== 'string' ||
    (s.note !== undefined && typeof s.note !== 'string')
  ) {
    return null
  }

  const packageNumber =
    typeof s.packageNumber === 'number' &&
    Number.isInteger(s.packageNumber) &&
    s.packageNumber > 0
      ? s.packageNumber
      : 1

  return {
    id: s.id,
    studentId: s.studentId,
    packageNumber,
    durationMinutes: s.durationMinutes,
    date: s.date,
    ...(typeof s.note === 'string' ? { note: s.note } : {}),
    ...(typeof s.splitGroupId === 'string' ? { splitGroupId: s.splitGroupId } : {}),
    ...(typeof s.splitPart === 'number' && Number.isInteger(s.splitPart) && s.splitPart > 0
      ? { splitPart: s.splitPart }
      : {}),
    ...(typeof s.splitPartCount === 'number' &&
    Number.isInteger(s.splitPartCount) &&
    s.splitPartCount > 1
      ? { splitPartCount: s.splitPartCount }
      : {}),
    createdAt: s.createdAt,
  }
}

function restoreRaw(key: string, raw: string | null): void {
  if (raw === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, raw)
  }
}

function normalizeStudents(values: unknown[]): Student[] {
  return values.map((value) => {
    const student = normalizeStudent(value)
    if (!student) {
      throw new Error('Invalid student record')
    }
    return student
  })
}

function normalizeSessions(values: unknown[]): Session[] {
  return values.map((value) => {
    const session = normalizeSession(value)
    if (!session) {
      throw new Error('Invalid session record')
    }
    return session
  })
}

function regroupSessionsForStudents(students: Student[], sessions: Session[]): Session[] {
  const studentById = new Map(students.map((student) => [student.id, student]))
  const sessionsByStudent = new Map<string, Session[]>()
  const orphanSessions: Session[] = []

  for (const session of sessions) {
    if (!studentById.has(session.studentId)) {
      orphanSessions.push(session)
      continue
    }
    const list = sessionsByStudent.get(session.studentId) ?? []
    list.push(session)
    sessionsByStudent.set(session.studentId, list)
  }

  const regrouped: Session[] = []
  for (const [studentId, studentSessions] of sessionsByStudent) {
    const student = studentById.get(studentId)
    if (!student) continue

    regrouped.push(...regroupSessionsByPackageHours(studentSessions, student.packageSize))
  }

  return [...orphanSessions, ...regrouped]
}

export function runDataMigration(): void {
  try {
    if (localStorage.getItem(STORAGE_KEYS.schemaVersion) === CURRENT_SCHEMA_VERSION) {
      return
    }

    const previousStudentsRaw = localStorage.getItem(STORAGE_KEYS.students)
    const previousSessionsRaw = localStorage.getItem(STORAGE_KEYS.sessions)
    const previousVersionRaw = localStorage.getItem(STORAGE_KEYS.schemaVersion)

    const students = normalizeStudents(parseArray(previousStudentsRaw))
    const sessions = regroupSessionsForStudents(
      students,
      normalizeSessions(parseArray(previousSessionsRaw)),
    )

    const nextStudents = JSON.stringify(students)
    const nextSessions = JSON.stringify(sessions)

    try {
      localStorage.setItem(STORAGE_KEYS.students, nextStudents)
      localStorage.setItem(STORAGE_KEYS.sessions, nextSessions)
      localStorage.setItem(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION)
    } catch (error) {
      restoreRaw(STORAGE_KEYS.students, previousStudentsRaw)
      restoreRaw(STORAGE_KEYS.sessions, previousSessionsRaw)
      restoreRaw(STORAGE_KEYS.schemaVersion, previousVersionRaw)
      throw error
    }
  } catch (error) {
    console.error('Data migration failed; existing data was left untouched.', error)
  }
}
