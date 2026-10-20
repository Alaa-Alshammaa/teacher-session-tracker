import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { formatDuration } from '../lib/duration'
import {
  formatDate,
  formatEur,
  formatHourNumber,
  formatHourNumberFromMinutes,
  formatHoursFromMinutes,
  formatMonthLabel,
} from '../lib/format'

export function useFormatters() {
  const { language, messages } = useLanguage()

  return useMemo(
    () => ({
      formatEur: (amount: number) => formatEur(amount, language),
      formatDate: (date: string) => formatDate(date, language),
      formatMonthLabel: (monthKey: string) => formatMonthLabel(monthKey, language),
      formatHoursFromMinutes: (minutes: number) =>
        formatHoursFromMinutes(minutes, language, messages),
      formatHourNumber: (hours: number) => formatHourNumber(hours),
      formatHourNumberFromMinutes: (minutes: number) => formatHourNumberFromMinutes(minutes),
      formatDuration: (minutes: number) => formatDuration(minutes, messages),
    }),
    [language, messages],
  )
}
