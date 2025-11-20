import { queryOptions } from '@tanstack/react-query'
import type { ExamClass, ExamSchedule, Group, StudentExam } from '@/types/class'
import { env } from '@/env'

function matchesStudent(studentId: string, range: string): boolean {
  const studentIdNum = parseInt(studentId, 10)
  if (isNaN(studentIdNum)) return false

  return range
    .split(',')
    .map((part) => part.trim())
    .some((range) => {
      if (range.includes('-')) {
        const [start, end] = range
          .split('-')
          .map((s) => s.trim())
          .map((s) => parseInt(s, 10))

        return (
          !isNaN(start) &&
          !isNaN(end) &&
          studentIdNum >= start &&
          studentIdNum <= end
        )
      }

      const singleId = parseInt(range, 10)
      return !isNaN(singleId) && studentIdNum === singleId
    })
}

function extractExams(data: ExamSchedule) {
  return Object.values(data).map((value) => ({ ...value }))
}

export const examRoomsQuery = (studentId: string) =>
  queryOptions({
    queryKey: ['thai-exam-rooms', studentId],
    queryFn: async () => {
      const response = await fetch(`${env.VITE_BASE_URL}/api/thai-exam-rooms`)
      const data: ExamSchedule = await response.json()
      const classes = extractExams(data)
      const exams: Array<ExamClass> = classes.map((classInfo) => ({
        ...classInfo,
        inRange: classInfo.group.some(
          (g) =>
            g.range &&
            typeof g.range === 'string' &&
            matchesStudent(studentId, g.range)
        ),
      }))

      return exams
    },
  })

export const studentExamsQuery = (studentId: string) =>
  queryOptions({
    queryKey: ['thai-my-exam-rooms', studentId],
    queryFn: async () => {
      const response = await fetch(`${env.VITE_BASE_URL}/api/thai-exam-rooms`)
      const data: ExamSchedule = await response.json()
      const classes = extractExams(data)
      const exams: Array<StudentExam> = classes.map((classInfo) => {
        const group: Group = classInfo.group.filter(
          (g) =>
            g.range &&
            typeof g.range === 'string' &&
            matchesStudent(studentId, g.range)
        )[0]
        return {
          ...classInfo,
          group,
          inRange: !!group,
        }
      })

      return exams.filter((c) => c.inRange)
    },
  })
