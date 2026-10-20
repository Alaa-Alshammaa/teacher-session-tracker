import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type TranslationSchema } from '../i18n'
import { translate } from '../i18n/translate'
import { DEFAULT_LANGUAGE, type Language } from '../i18n/types'
import { STORAGE_KEYS } from '../lib/storageKeys'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string, vars?: Record<string, string | number>) => string
  messages: TranslationSchema
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.language)
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEYS.language, lang)
  }, [])

  const messages = translations[language]

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => translate(messages, path, vars),
    [messages],
  )

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({ language, setLanguage, t, messages }),
    [language, setLanguage, t, messages],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
