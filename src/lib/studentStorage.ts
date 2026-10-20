import { DEFAULT_PACKAGE_SIZE, type Student } from '../types/student'
import { STORAGE_KEYS } from './storageKeys'

function readStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.students)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidStudent)
  } catch {
    return []
  }
}

function isValidStudent(value: unknown): value is Student {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.hourlyRateEur === 'number' &&
    Number.isFinite(s.hourlyRateEur) &&
    typeof s.packageSize === 'number' &&
    Number.isFinite(s.packageSize) &&
    s.packageSize > 0 &&
    typeof s.createdAt === 'string'
  )
}

function writeStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students))
}

export function getStudents(): Student[] {
  return readStudents().sort((a, b) => a.name.localeCompare(b.name))
}

export function getStudentById(id: string): Student | undefined {
  return readStudents().find((s) => s.id === id)
}

export function addStudent(name: string, hourlyRateEur: number): Student {
  const student: Student = {
    id: crypto.randomUUID(),
    name: name.trim(),
    hourlyRateEur,
    packageSize: DEFAULT_PACKAGE_SIZE,
    createdAt: new Date().toISOString(),
  }
  const students = readStudents()
  students.push(student)
  writeStudents(students)
  return student
}

export function updateStudentRate(id: string, hourlyRateEur: number): Student | null {
  const students = readStudents()
  const index = students.findIndex((s) => s.id === id)
  if (index === -1) return null
  students[index] = { ...students[index], hourlyRateEur }
  writeStudents(students)
  return students[index]
}

export function updateStudentPackageSize(id: string, packageSize: number): Student | null {
  const students = readStudents()
  const index = students.findIndex((s) => s.id === id)
  if (index === -1) return null
  students[index] = { ...students[index], packageSize }
  writeStudents(students)
  return students[index]
}

export function deleteStudent(id: string): boolean {
  const students = readStudents()
  const next = students.filter((s) => s.id !== id)
  if (next.length === students.length) return false
  writeStudents(next)
  return true
}
