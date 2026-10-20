import type { TranslationSchema } from '../i18n/en'
import type { DurationUnit } from '../types/session'

export function toDurationMinutes(value: number, unit: DurationUnit): number {
  if (unit === 'hours') return Math.round(value * 60)
  return Math.round(value)
}

export function formatDuration(minutes: number, messages: TranslationSchema): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return messages.duration.minutes.replace('{count}', String(mins))
  }
  if (mins === 0) {
    if (hours === 1) return messages.duration.oneHour
    return messages.duration.hours.replace('{count}', String(hours))
  }
  return messages.duration.compact
    .replace('{hours}', String(hours))
    .replace('{minutes}', String(mins))
}

export function todayDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
