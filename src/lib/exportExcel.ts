import type { TranslationSchema } from '../i18n/en'
import type { PackageSummary } from './summary'
import type { Student } from '../types/student'
import { getSessionDisplayNote } from './packageSplitting'
import { isPackagePaid } from './packagePayment'

export interface ExcelLabels {
  student: string
  hourlyRate: string
  period: string
  date: string
  durationHours: string
  notes: string
  fee: string
  totalSessions: string
  totalHours: string
  totalFees: string
  package: string
  paymentStatus: string
}

const DARK_BLUE = '1E3A5F'
const LIGHT_BLUE = 'D6E4F0'
const MID_BLUE = '2E75B6'
const ALT_ROW = 'EBF3FB'
const GREEN = 'E2EFDA'
const WHITE = 'FFFFFF'
const BORDER_COLOR = 'B0C4DE'

export function getExcelLabels(messages: TranslationSchema): ExcelLabels {
  return {
    student: messages.excel.student,
    hourlyRate: messages.excel.hourlyRate,
    period: messages.excel.period,
    date: messages.excel.date,
    durationHours: messages.excel.durationHours,
    notes: messages.excel.notes,
    fee: messages.excel.fee,
    totalSessions: messages.excel.totalSessions,
    totalHours: messages.excel.totalHours,
    totalFees: messages.excel.totalFees,
    package: messages.excel.package,
    paymentStatus: messages.excel.paymentStatus,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, '').trim()
  return (cleaned || 'Package').slice(0, 31)
}

function border() {
  return {
    top: { style: 'thin', color: { rgb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { rgb: BORDER_COLOR } },
    left: { style: 'thin', color: { rgb: BORDER_COLOR } },
    right: { style: 'thin', color: { rgb: BORDER_COLOR } },
  }
}

function cellStyle(
  bgColor: string,
  fontColor: string,
  bold: boolean,
  fontSize: number,
  horizontal: string,
) {
  return {
    fill: { patternType: 'solid', fgColor: { rgb: bgColor } },
    font: { bold, color: { rgb: fontColor }, sz: fontSize },
    alignment: { horizontal, vertical: 'center', wrapText: true },
    border: border(),
  }
}

function buildPackageWorksheet(
  student: Student,
  pkg: PackageSummary,
  labels: ExcelLabels,
  messages: TranslationSchema,
) {
  const ws: Record<string, unknown> = {}
  let row = 0

  ws[`A${row + 1}`] = {
    v: `${messages.summary.packageTitle.replace('{number}', String(pkg.packageNumber))} — ${student.name}`,
    s: cellStyle(DARK_BLUE, WHITE, true, 14, 'center'),
  }
  ws[`B${row + 1}`] = { v: '', s: cellStyle(DARK_BLUE, WHITE, true, 14, 'center') }
  ws[`C${row + 1}`] = { v: '', s: cellStyle(DARK_BLUE, WHITE, true, 14, 'center') }
  ws[`D${row + 1}`] = { v: '', s: cellStyle(DARK_BLUE, WHITE, true, 14, 'center') }
  row++

  const infoRows = [
    [labels.student, student.name],
    [labels.hourlyRate, student.hourlyRateEur],
    [labels.package, pkg.packageNumber],
    [
      labels.paymentStatus,
      isPackagePaid(student.id, pkg.packageNumber)
        ? messages.summary.packagePaid
        : messages.summary.packageUnpaid,
    ],
  ]
  for (const [label, value] of infoRows) {
    ws[`A${row + 1}`] = { v: label, s: cellStyle(LIGHT_BLUE, DARK_BLUE, true, 11, 'left') }
    ws[`B${row + 1}`] = { v: value, s: cellStyle(LIGHT_BLUE, DARK_BLUE, false, 11, 'left') }
    ws[`C${row + 1}`] = { v: '', s: cellStyle(LIGHT_BLUE, DARK_BLUE, false, 11, 'left') }
    ws[`D${row + 1}`] = { v: '', s: cellStyle(LIGHT_BLUE, DARK_BLUE, false, 11, 'left') }
    row++
  }

  row++

  const colHeaders = [labels.date, labels.durationHours, labels.notes, labels.fee]
  const cols = ['A', 'B', 'C', 'D']
  colHeaders.forEach((header, index) => {
    ws[`${cols[index]}${row + 1}`] = {
      v: header,
      s: cellStyle(MID_BLUE, WHITE, true, 11, 'center'),
    }
  })
  row++

  for (let i = 0; i < pkg.sessions.length; i++) {
    const session = pkg.sessions[i]
    const hours = round2(session.durationMinutes / 60)
    const fee = round2(hours * student.hourlyRateEur)
    const bg = i % 2 === 0 ? WHITE : ALT_ROW
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${session.date}T00:00:00`))

    ws[`A${row + 1}`] = { v: formattedDate, s: cellStyle(bg, '333333', false, 10, 'left') }
    ws[`B${row + 1}`] = { v: hours, s: cellStyle(bg, '333333', false, 10, 'center') }
    ws[`C${row + 1}`] = {
      v: getSessionDisplayNote(session),
      s: cellStyle(bg, '333333', false, 10, 'left'),
    }
    ws[`D${row + 1}`] = { v: fee, s: cellStyle(bg, '333333', false, 10, 'center') }
    row++
  }

  row++

  ws[`A${row + 1}`] = { v: labels.totalSessions, s: cellStyle(GREEN, '375623', true, 11, 'left') }
  ws[`B${row + 1}`] = { v: pkg.sessionCount, s: cellStyle(GREEN, '375623', true, 11, 'center') }
  ws[`C${row + 1}`] = { v: labels.totalHours, s: cellStyle(GREEN, '375623', true, 11, 'left') }
  ws[`D${row + 1}`] = { v: round2(pkg.totalHours), s: cellStyle(GREEN, '375623', true, 11, 'center') }
  row++

  ws[`A${row + 1}`] = { v: labels.totalFees, s: cellStyle(GREEN, '375623', true, 12, 'left') }
  ws[`B${row + 1}`] = { v: '', s: cellStyle(GREEN, '375623', true, 12, 'center') }
  ws[`C${row + 1}`] = { v: '', s: cellStyle(GREEN, '375623', true, 12, 'center') }
  ws[`D${row + 1}`] = { v: round2(pkg.totalFeesEur), s: cellStyle(GREEN, '375623', true, 12, 'center') }
  row++

  ws['!ref'] = `A1:D${row}`
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]
  ws['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 34 }, { wch: 14 }]
  ws['!rows'] = [{ hpt: 32 }, { hpt: 22 }, { hpt: 22 }, { hpt: 22 }]

  return ws as never
}

export async function exportPackageToExcel(
  student: Student,
  pkg: PackageSummary,
  labels: ExcelLabels,
  messages: TranslationSchema,
): Promise<void> {
  const XLSX = await import('xlsx-js-style')
  const workbook = XLSX.utils.book_new()
  const worksheet = buildPackageWorksheet(student, pkg, labels, messages)
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sanitizeSheetName(`${labels.package} ${pkg.packageNumber}`),
  )

  const namePart = sanitizeFilenamePart(student.name) || 'Student'
  XLSX.writeFile(workbook, `${namePart}-Package-${pkg.packageNumber}.xlsx`)
}

export async function exportAllPackagesToExcel(
  student: Student,
  packages: PackageSummary[],
  labels: ExcelLabels,
  messages: TranslationSchema,
): Promise<void> {
  const XLSX = await import('xlsx-js-style')
  const workbook = XLSX.utils.book_new()

  for (const pkg of [...packages].sort((a, b) => a.packageNumber - b.packageNumber)) {
    const worksheet = buildPackageWorksheet(student, pkg, labels, messages)
    const sheetName = sanitizeSheetName(`Package ${pkg.packageNumber}`)
    workbook.SheetNames.push(sheetName)
    workbook.Sheets[sheetName] = worksheet
  }

  const namePart = sanitizeFilenamePart(student.name) || 'Student'
  XLSX.writeFile(workbook, `${namePart}-All-Packages.xlsx`)
}