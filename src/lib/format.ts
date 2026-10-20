import { getIntlLocale, type Language } from '../i18n'
import type { TranslationSchema } from '../i18n/en'

export function formatEur(amount: number, language: Language): string {
  return new Intl.NumberFormat(getIntlLocale(language), {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatHoursFromMinutes(
  minutes: number,
  _language: Language,
  messages: TranslationSchema,
): string {
  const hours = minutes / 60
  if (hours === 0) return messages.duration.zeroHours
  if (Number.isInteger(hours)) {
    return messages.duration.hoursShort.replace('{count}', String(hours))
  }
  return messages.duration.hoursShortDecimal.replace('{count}', hours.toFixed(1))
}

export function formatHourNumber(hours: number): string {
  if (Number.isInteger(hours)) return String(hours)
  const roundedOneDecimal = Math.round(hours * 10) / 10
  if (Math.abs(hours - roundedOneDecimal) < 0.001) return roundedOneDecimal.toFixed(1)
  return (Math.round(hours * 100) / 100).toFixed(2)
}

export function formatHourNumberFromMinutes(minutes: number): string {
  return formatHourNumber(minutes / 60)
}

export function formatDate(date: string, language: Language): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(getIntlLocale(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
}

export function formatMonthLabel(monthKey: string, language: Language): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat(getIntlLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, 1))
}

export function currentMonthKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
