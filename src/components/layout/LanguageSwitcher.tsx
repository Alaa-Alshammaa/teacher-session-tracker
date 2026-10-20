import { useLanguage } from '../../context/LanguageContext'
import type { Language } from '../../i18n/types'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  function select(lang: Language) {
    setLanguage(lang)
  }

  return (
    <div
      className="flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5"
      role="group"
      aria-label={t('lang.switch')}
    >
      {(['en', 'de'] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => select(lang)}
          className={`min-h-8 min-w-9 rounded-md px-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            language === lang
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={language === lang}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
