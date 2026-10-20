import { useMemo, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { buildShareSummaryText, getWhatsAppWebShareUrl } from '../../lib/shareSummaryText'
import type { PackageSummary } from '../../lib/summary'
import type { Student } from '../../types/student'

interface ShareSummaryPanelProps {
  student: Student
  pkg: PackageSummary
}

export function ShareSummaryPanel({ student, pkg }: ShareSummaryPanelProps) {
  const { t, language, messages } = useLanguage()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const text = useMemo(
    () => buildShareSummaryText(student, pkg, language, messages),
    [student, pkg, language, messages],
  )

  async function handleCopy() {
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
    }
  }

  function handleWhatsApp() {
    window.open(getWhatsAppWebShareUrl(text), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="border-t border-slate-100 px-5 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-expanded={open}
      >
        {open ? t('summary.shareHide') : t('summary.shareShow')}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('summary.sharePreview')}
            </span>
            <textarea
              readOnly
              value={text}
              rows={Math.min(12, text.split('\n').length + 1)}
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              onFocus={(e) => e.target.select()}
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-3 sm:py-1.5"
            >
              {copied ? t('summary.shareCopied') : t('summary.shareCopy')}
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="min-h-11 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1fb855] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 sm:px-3 sm:py-1.5"
            >
              {t('summary.shareWhatsApp')}
            </button>
          </div>

          {copyError && (
            <p className="text-sm text-red-600" role="alert">
              {t('summary.shareCopyError')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
