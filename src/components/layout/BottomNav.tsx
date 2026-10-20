import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { LogSessionIcon, SettingsIcon, StudentsIcon, SummaryIcon } from './NavIcons'

const navItems = [
  { to: '/students', labelKey: 'nav.students', Icon: StudentsIcon },
  { to: '/log-session', labelKey: 'nav.logSession', Icon: LogSessionIcon },
  { to: '/summary', labelKey: 'nav.summary', Icon: SummaryIcon },
  { to: '/settings', labelKey: 'nav.settings', Icon: SettingsIcon },
] as const

function linkClass(isActive: boolean) {
  return `flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[11px] font-medium leading-tight transition-colors ${
    isActive ? 'text-indigo-600' : 'text-slate-500 active:text-indigo-600'
  }`
}

export function BottomNav() {
  const { t } = useLanguage()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label={t('nav.main')}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around px-2 pt-1">
        {navItems.map(({ to, labelKey, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? 'bg-indigo-100' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
