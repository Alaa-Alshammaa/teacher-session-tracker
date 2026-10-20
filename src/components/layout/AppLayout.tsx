import { NavLink, Outlet } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { BottomNav } from './BottomNav'
import { LanguageSwitcher } from './LanguageSwitcher'

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function AppLayout() {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-4">
          <h1 className="min-w-0 truncate text-base font-semibold text-slate-900 sm:text-lg">
            {t('app.title')}
          </h1>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <nav className="hidden gap-1 md:flex" aria-label={t('nav.main')}>
              <NavLink to="/students" className={desktopNavClass}>
                {t('nav.students')}
              </NavLink>
              <NavLink to="/log-session" className={desktopNavClass}>
                {t('nav.logSession')}
              </NavLink>
              <NavLink to="/summary" className={desktopNavClass}>
                {t('nav.summary')}
              </NavLink>
              <NavLink to="/settings" className={desktopNavClass}>
                {t('nav.settings')}
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:py-6 md:pb-8 md:py-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
