import { AddStudentForm } from '../components/students/AddStudentForm'
import { StudentList } from '../components/students/StudentList'
import { useLanguage } from '../context/LanguageContext'
import { useStudents } from '../hooks/useStudents'

export function StudentsPage() {
  const { t } = useLanguage()
  const { students, addStudent, updateRate, updatePackageSize, removeStudent } = useStudents()

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{t('students.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('students.subtitle')}</p>
      </div>

      <AddStudentForm onAdd={addStudent} />

      <StudentList
        students={students}
        onUpdateRate={updateRate}
        onUpdatePackageSize={updatePackageSize}
        onDelete={removeStudent}
      />
    </div>
  )
}
