import { env } from '@/env'
import {
  ClassSchedule,
  ClassInfoWithInRange,
  MyClassInfoWithInRange,
  Group,
} from '@/types/class'
import { queryOptions } from '@tanstack/react-query'

function isStudentInRange(studentId: string, range: string): boolean {
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

function mapClassesFromData(data: ClassSchedule) {
  return Object.values(data).map((value) => ({ ...value }))
}

export const thaiExamRoomsQueryOptions = (studentId: string) =>
  queryOptions({
    queryKey: ['thai-exam-rooms', studentId],
    queryFn: async () => {
      const response = await fetch(`${env.VITE_BASE_URL}/api/thai-exam-rooms`)
      const data: ClassSchedule = await response.json()
      const classes = mapClassesFromData(data)
      const classesWithInRange: ClassInfoWithInRange[] = classes.map(
        (classInfo) => ({
          ...classInfo,
          inRange: classInfo.group.some(
            (g) =>
              g.range &&
              typeof g.range === 'string' &&
              isStudentInRange(studentId, g.range)
          ),
        })
      )

      return classesWithInRange
    },
  })

export const thaiMyExamRoomsQueryOptions = (studentId: string) =>
  queryOptions({
    queryKey: ['thai-my-exam-rooms', studentId],
    queryFn: async () => {
      const response = await fetch(`${env.VITE_BASE_URL}/api/thai-exam-rooms`)
      const data: ClassSchedule = await response.json()
      const classes = mapClassesFromData(data)
      const classesWithInRange: MyClassInfoWithInRange[] = classes.map(
        (classInfo) => {
          const group: Group = classInfo.group.filter(
            (g) =>
              g.range &&
              typeof g.range === 'string' &&
              isStudentInRange(studentId, g.range)
          )[0]
          return {
            ...classInfo,
            group,
            inRange: !!group,
          }
        }
      )

      return classesWithInRange.filter((c) => c.inRange)
    },
  })
