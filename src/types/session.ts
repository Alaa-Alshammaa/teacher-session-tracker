export interface Session {
  id: string
  studentId: string
  packageNumber: number
  durationMinutes: number
  date: string
  note?: string
  splitGroupId?: string
  splitPart?: number
  splitPartCount?: number
  createdAt: string
}

export type DurationUnit = 'hours' | 'minutes'
