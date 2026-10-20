import type { Session } from '../types/session'
import { DEFAULT_PACKAGE_SIZE } from '../types/student'
import {
  getPackageSizeMinutes,
  getLogicalSessionId,
  regroupSessionsByPackageHours,
  sortSessionsByDateAsc,
} from './packageSplitting'
import { getStudentById } from './studentStorage'
import { STORAGE_KEYS } from './storageKeys'

function readSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.sessions)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidSession)
  } catch {
    return []
  }
}

function isValidSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.studentId === 'string' &&
    typeof s.packageNumber === 'number' &&
    Number.isInteger(s.packageNumber) &&
    s.packageNumber > 0 &&
    typeof s.durationMinutes === 'number' &&
    Number.isFinite(s.durationMinutes) &&
    s.durationMinutes > 0 &&
    typeof s.date === 'string' &&
    typeof s.createdAt === 'string' &&
    (s.note === undefined || typeof s.note === 'string') &&
    (s.splitGroupId === undefined || typeof s.splitGroupId === 'string') &&
    (s.splitPart === undefined ||
      (typeof s.splitPart === 'number' && Number.isInteger(s.splitPart) && s.splitPart > 0)) &&
    (s.splitPartCount === undefined ||
      (typeof s.splitPartCount === 'number' &&
        Number.isInteger(s.splitPartCount) &&
        s.splitPartCount > 1))
  )
}

function writeSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions))
}

export function regroupSessionsForStudent(studentId: string, packageSizeHours: number): Session[] {
  const sessions = readSessions()
  const targetSessions = sessions.filter((s) => s.studentId === studentId)
  const otherSessions = sessions.filter((s) => s.studentId !== studentId)
  const regrouped = regroupSessionsByPackageHours(targetSessions, packageSizeHours)
  writeSessions([...otherSessions, ...regrouped])
  return regrouped
}

export function getSessions(): Session[] {
  return sortSessionsByDateAsc(readSessions())
}

export interface NewSessionInput {
  studentId: string
  durationMinutes: number
  date: string
  note?: string
}

export interface LoggedSessionResult {
  session: Session
  packageComplete: boolean
}

export interface UpdateSessionInput {
  durationMinutes: number
  date: string
  note?: string
}

export function addSession(input: NewSessionInput): LoggedSessionResult {
  const note = input.note?.trim()
  const student = getStudentById(input.studentId)
  const packageSize = student?.packageSize ?? DEFAULT_PACKAGE_SIZE
  const session: Session = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    packageNumber: 1,
    durationMinutes: input.durationMinutes,
    date: input.date,
    ...(note ? { note } : {}),
    createdAt: new Date().toISOString(),
  }
  const sessions = readSessions()
  const targetSessions = sessions.filter((s) => s.studentId === input.studentId)
  const otherSessions = sessions.filter((s) => s.studentId !== input.studentId)
  const regrouped = regroupSessionsByPackageHours([...targetSessions, session], packageSize)
  writeSessions([...otherSessions, ...regrouped])

  const savedSessions = regrouped.filter((s) => (s.splitGroupId ?? s.id) === session.id)
  const packageSizeMinutes = getPackageSizeMinutes(packageSize)
  const packageComplete = savedSessions.some((savedSession) => {
    const packageMinutes = regrouped
      .filter((s) => s.packageNumber === savedSession.packageNumber)
      .reduce((sum, s) => sum + s.durationMinutes, 0)
    return packageMinutes >= packageSizeMinutes
  })

  return {
    session: savedSessions[0] ?? session,
    packageComplete,
  }
}

export function updateSession(logicalSessionId: string, input: UpdateSessionInput): boolean {
  const sessions = readSessions()
  const targetSessions = sessions.filter((s) => getLogicalSessionId(s) === logicalSessionId)
  const existingSession = sortSessionsByDateAsc(targetSessions)[0]
  if (!existingSession) return false

  const note = input.note?.trim()
  const student = getStudentById(existingSession.studentId)
  const packageSize = student?.packageSize ?? DEFAULT_PACKAGE_SIZE
  const updatedSession: Session = {
    id: logicalSessionId,
    studentId: existingSession.studentId,
    packageNumber: 1,
    durationMinutes: input.durationMinutes,
    date: input.date,
    ...(note ? { note } : {}),
    createdAt: existingSession.createdAt,
  }

  const remainingSessions = sessions.filter((s) => getLogicalSessionId(s) !== logicalSessionId)
  const studentSessions = remainingSessions.filter((s) => s.studentId === existingSession.studentId)
  const otherSessions = remainingSessions.filter((s) => s.studentId !== existingSession.studentId)
  const regrouped = regroupSessionsByPackageHours([...studentSessions, updatedSession], packageSize)
  writeSessions([...otherSessions, ...regrouped])
  return true
}

export function deleteSession(logicalSessionId: string): boolean {
  const sessions = readSessions()
  const targetSession = sessions.find((s) => getLogicalSessionId(s) === logicalSessionId)
  if (!targetSession) return false

  const student = getStudentById(targetSession.studentId)
  const packageSize = student?.packageSize ?? DEFAULT_PACKAGE_SIZE
  const remainingSessions = sessions.filter((s) => getLogicalSessionId(s) !== logicalSessionId)
  const studentSessions = remainingSessions.filter((s) => s.studentId === targetSession.studentId)
  const otherSessions = remainingSessions.filter((s) => s.studentId !== targetSession.studentId)
  const regrouped = regroupSessionsByPackageHours(studentSessions, packageSize)
  writeSessions([...otherSessions, ...regrouped])
  return true
}
