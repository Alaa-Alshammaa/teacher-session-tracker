import { useLanguage } from '../../context/LanguageContext'
import { ALL_PACKAGES, type PackageFilter } from '../../lib/summary'

interface PackageSelectorProps {
  value: PackageFilter
  availablePackages: number[]
  onChange: (pkg: PackageFilter) => void
}

export function PackageSelector({
  value,
  availablePackages,
  onChange,
}: PackageSelectorProps) {
  const { t } = useLanguage()

  return (
    <label className="block sm:inline-flex sm:items-center sm:gap-2">
      <span className="mb-1 block text-sm font-medium text-slate-700 sm:mb-0">
        {t('summary.packageSelector')}
      </span>
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value === ALL_PACKAGES ? ALL_PACKAGES : Number(e.target.value))
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
      >
        <option value={ALL_PACKAGES}>{t('summary.allPackages')}</option>
        {availablePackages.map((packageNumber) => (
          <option key={packageNumber} value={packageNumber}>
            {t('summary.packageOption', { number: packageNumber })}
          </option>
        ))}
      </select>
    </label>
  )
}
