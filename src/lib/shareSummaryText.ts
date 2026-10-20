import type { Language } from '../i18n'
import type { TranslationSchema } from '../i18n/en'
import { translate } from '../i18n/translate'
import { formatDuration } from './duration'
import {
  formatDate,
  formatEur,
  formatHoursFromMinutes,
} from './format'
import { getSessionDisplayNote } from './packageSplitting'
import type { PackageSummary } from './summary'
import type { Student } from '../types/student'

export function buildShareSummaryText(
  student: Student,
  pkg: PackageSummary,
  language: Language,
  messages: TranslationSchema,
): string {
  const t = (path: string, vars?: Record<string, string | number>) =>
    translate(messages, path, vars)

  const lines: string[] = [
    t('shareText.title', { name: student.name }),
    messages.summary.packageTitle.replace('{number}', String(pkg.packageNumber)),
    '',
    t('shareText.hourlyRate', { rate: formatEur(student.hourlyRateEur, language) }),
    t('shareText.sessions', { count: pkg.sessionCount }),
    t('shareText.totalHours', {
      hours: formatHoursFromMinutes(pkg.totalMinutes, language, messages),
    }),
    t('shareText.totalFees', { amount: formatEur(pkg.totalFeesEur, language) }),
    '',
    messages.shareText.sessionsHeader,
  ]

  for (const session of pkg.sessions) {
    const fee = (session.durationMinutes / 60) * student.hourlyRateEur
    const displayNote = getSessionDisplayNote(session)
    lines.push(
      `• ${formatDate(session.date, language)} — ${formatDuration(session.durationMinutes, messages)} — ${formatEur(fee, language)}`,
    )
    if (displayNote) {
      lines.push(`  ${displayNote}`)
    }
  }

  return lines.join('\n')
}

export function getWhatsAppWebShareUrl(text: string): string {
  return `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`
}
