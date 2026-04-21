import { queryOptions } from '@tanstack/react-query'
import type { ExamSchedule, Group, StudentExam } from '@/types/class'
import { env } from '@/env'

function findStudentInGroup(
  studentId: string,
  group: Group
): { found: boolean; seat: number; withdrawn: boolean } {
  const student = group.student_list.find((s) => s.id === studentId)
  if (student) {
    return { found: true, seat: student.seat, withdrawn: student.withdrawn }
  }
  return { found: false, seat: 0, withdrawn: false }
}

function extractExams(data: ExamSchedule) {
  return Object.values(data).map((value) => ({ ...value }))
}

export const studentExamsQuery = (studentId: string) =>
  queryOptions({
    queryKey: ['thai-my-exam-rooms', studentId],
    queryFn: async () => {
      const response = await fetch(`${env.VITE_BASE_URL}/api/thai-exam-rooms`)
      const data: ExamSchedule = await response.json()
      const classes = extractExams(data)
      const exams: Array<StudentExam> = []

      for (const classInfo of classes) {
        for (const group of classInfo.group) {
          const { found, seat, withdrawn } = findStudentInGroup(
            studentId,
            group
          )
          if (found && !withdrawn) {
            exams.push({
              ...classInfo,
              group,
              seat,
            })
            break
          }
        }
      }

      return exams
    },
  })
