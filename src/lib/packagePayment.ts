export const PACKAGE_PAYMENT_STATUS_KEY = 'tst_package_payment_status'

export type PackagePaymentStatuses = Record<string, boolean>

export function getPackagePaymentKey(studentId: string, packageNumber: number): string {
  return `${studentId}:${packageNumber}`
}

export function readPackagePaymentStatuses(): PackagePaymentStatuses {
  try {
    const raw = localStorage.getItem(PACKAGE_PAYMENT_STATUS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, boolean] => {
        const [key, value] = entry
        return typeof key === 'string' && typeof value === 'boolean'
      }),
    )
  } catch {
    return {}
  }
}

export function writePackagePaymentStatuses(statuses: PackagePaymentStatuses): void {
  localStorage.setItem(PACKAGE_PAYMENT_STATUS_KEY, JSON.stringify(statuses))
}

export function isPackagePaid(studentId: string, packageNumber: number): boolean {
  return readPackagePaymentStatuses()[getPackagePaymentKey(studentId, packageNumber)] ?? false
}

export function writePackagePaymentStatus(
  studentId: string,
  packageNumber: number,
  isPaid: boolean,
): PackagePaymentStatuses {
  const statuses = readPackagePaymentStatuses()
  statuses[getPackagePaymentKey(studentId, packageNumber)] = isPaid
  writePackagePaymentStatuses(statuses)
  return statuses
}
