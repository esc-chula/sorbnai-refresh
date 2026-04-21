import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { studentExamsQuery } from '@/data/thai-exam-rooms'
import { ExamTable } from '@/components/exam-table'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getRouter } from '@/router'

export const Route = createFileRoute('/_protected/schedule')({
  component: Schedule,
})

function Schedule() {
  const { studentId } = Route.useSearch()
  const { data: examRooms } = useSuspenseQuery(studentExamsQuery(studentId))
  const [_, setStoredId] = useLocalStorage('student-id', '')

  const studentName = useMemo(() => {
    for (const exam of examRooms) {
      const student = exam.group.student_list.find((s) => s.id === studentId)
      if (student) return student.name
    }
    return ''
  }, [examRooms, studentId])

  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const logout = () => {
    setStoredId('')
    getRouter().navigate({ to: '/' })
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center gap-4 p-4 sm:max-w-4xl">
      <Card className="w-full">
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <span className="text-muted-foreground text-sm">{studentId}</span>
            <span className="truncate text-base font-semibold">
              {studentName || '—'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="shrink-0 gap-2"
          >
            <LogOut className="size-4" />
            <span>ออกจากระบบ</span>
          </Button>
        </CardContent>
      </Card>

      <ExamTable exams={examRooms} />
    </div>
  )
}
