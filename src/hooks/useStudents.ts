import { useCallback, useEffect, useState } from 'react'
import type { Student } from '../types/student'
import * as sessionStorage from '../lib/sessionStorage'
import * as studentStorage from '../lib/studentStorage'

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])

  const refresh = useCallback(() => {
    setStudents(studentStorage.getStudents())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addStudent = useCallback(
    (name: string, hourlyRateEur: number) => {
      studentStorage.addStudent(name, hourlyRateEur)
      refresh()
    },
    [refresh],
  )

  const updateRate = useCallback(
    (id: string, hourlyRateEur: number) => {
      studentStorage.updateStudentRate(id, hourlyRateEur)
      refresh()
    },
    [refresh],
  )

  const updatePackageSize = useCallback(
    (id: string, packageSize: number) => {
      studentStorage.updateStudentPackageSize(id, packageSize)
      sessionStorage.regroupSessionsForStudent(id, packageSize)
      refresh()
    },
    [refresh],
  )

  const removeStudent = useCallback(
    (id: string) => {
      studentStorage.deleteStudent(id)
      refresh()
    },
    [refresh],
  )

  return { students, addStudent, updateRate, updatePackageSize, removeStudent }
}
