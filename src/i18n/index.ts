import type { Language } from './types'
import { de } from './de'
import { en, type TranslationSchema } from './en'

export const translations: Record<Language, TranslationSchema> = { en, de }

export function getIntlLocale(language: Language): string {
  return language === 'de' ? 'de-DE' : 'en-GB'
}

export type { Language, TranslationSchema }
export { en, de }
