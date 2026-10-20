type IconProps = { className?: string }

export function StudentsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function LogSessionIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M21 3l-7 7" />
    </svg>
  )
}

export function SummaryIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17V11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17V7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 17v-4" />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93l2.12 2.12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.95 16.95l2.12 2.12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 19.07l2.12-2.12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.95 7.05l2.12-2.12" />
    </svg>
  )
}
