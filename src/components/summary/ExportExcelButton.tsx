import { useLanguage } from '../../context/LanguageContext'
import {
  exportAllPackagesToExcel,
  exportPackageToExcel,
  getExcelLabels,
} from '../../lib/exportExcel'
import type { PackageSummary } from '../../lib/summary'
import type { Student } from '../../types/student'

interface ExportExcelButtonProps {
  student: Student
  pkg?: PackageSummary
  packages?: PackageSummary[]
  className?: string
}

export function ExportExcelButton({
  student,
  pkg,
  packages,
  className = '',
}: ExportExcelButtonProps) {
  const { t, messages } = useLanguage()

  function handleExport() {
    if (pkg) {
      void exportPackageToExcel(student, pkg, getExcelLabels(messages), messages)
      return
    }
    if (packages) {
      void exportAllPackagesToExcel(student, packages, getExcelLabels(messages), messages)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className={
        className ||
        'min-h-11 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:min-h-0 sm:px-3 sm:py-1.5'
      }
    >
      {pkg ? t('summary.exportPackageExcel') : t('summary.exportAllPackagesExcel')}
    </button>
  )
}
