import type { Session } from '../types/session'

interface LogicalSession {
  id: string
  studentId: string
  durationMinutes: number
  date: string
  note?: string
  createdAt: string
}

export function getPackageSizeMinutes(packageSizeHours: number): number {
  return Math.max(1, Math.round(packageSizeHours * 60))
}

export function getLogicalSessionId(session: Session): string {
  return session.splitGroupId ?? session.id
}

export function sortSessionsByDateAsc(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.createdAt.localeCompare(b.createdAt) ||
      getLogicalSessionId(a).localeCompare(getLogicalSessionId(b)) ||
      (a.splitPart ?? 0) - (b.splitPart ?? 0) ||
      a.id.localeCompare(b.id),
  )
}

function toLogicalSessions(sessions: Session[]): LogicalSession[] {
  const byLogicalId = new Map<string, LogicalSession>()

  for (const session of sortSessionsByDateAsc(sessions)) {
    const logicalId = getLogicalSessionId(session)
    const existing = byLogicalId.get(logicalId)

    if (existing) {
      existing.durationMinutes += session.durationMinutes
      if (!existing.note && session.note) {
        existing.note = session.note
      }
      continue
    }

    byLogicalId.set(logicalId, {
      id: logicalId,
      studentId: session.studentId,
      durationMinutes: session.durationMinutes,
      date: session.date,
      ...(session.note ? { note: session.note } : {}),
      createdAt: session.createdAt,
    })
  }

  return Array.from(byLogicalId.values()).sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.createdAt.localeCompare(b.createdAt) ||
      a.id.localeCompare(b.id),
  )
}

export function regroupSessionsByPackageHours(
  sessions: Session[],
  packageSizeHours: number,
): Session[] {
  const packageSizeMinutes = getPackageSizeMinutes(packageSizeHours)
  const regrouped: Session[] = []
  let packageNumber = 1
  let currentPackageMinutes = 0

  for (const session of toLogicalSessions(sessions)) {
    const pieces: Session[] = []
    let remainingMinutes = session.durationMinutes

    while (remainingMinutes > 0) {
      if (currentPackageMinutes >= packageSizeMinutes) {
        packageNumber += 1
        currentPackageMinutes = 0
      }

      const remainingInPackage = packageSizeMinutes - currentPackageMinutes
      const durationMinutes = Math.min(remainingMinutes, remainingInPackage)

      pieces.push({
        id: session.id,
        studentId: session.studentId,
        packageNumber,
        durationMinutes,
        date: session.date,
        ...(session.note ? { note: session.note } : {}),
        createdAt: session.createdAt,
      })

      currentPackageMinutes += durationMinutes
      remainingMinutes -= durationMinutes

      if (currentPackageMinutes >= packageSizeMinutes) {
        packageNumber += 1
        currentPackageMinutes = 0
      }
    }

    const splitPartCount = pieces.length
    regrouped.push(
      ...pieces.map((piece, index) => {
        if (splitPartCount === 1) {
          return piece
        }

        const splitPart = index + 1
        return {
          ...piece,
          id: `${session.id}:part-${splitPart}`,
          splitGroupId: session.id,
          splitPart,
          splitPartCount,
        }
      }),
    )
  }

  return regrouped
}

export function getSessionDisplayNote(session: Session): string {
  const splitPart =
    session.splitPart && session.splitPartCount && session.splitPartCount > 1
      ? `(Part ${session.splitPart})`
      : ''

  return [session.note, splitPart].filter(Boolean).join(' ')
}
