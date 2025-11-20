import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'
import { ConfirmIdModal } from '@/components/confirm-id-modal'
import { useSyncExams } from '@/hooks/use-sync-exams'

const searchSchema = z.object({
  studentId: z
    .string()
    .length(10, { message: 'Student ID must be 10 characters long' })
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Student ID must be only digits',
    })
    .refine((val) => val.endsWith('21'), {
      message: 'Student ID must end with 21',
    })
    .catch(''),
  exams: z.array(z.string()).catch([]),
})

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (!search.studentId || search.studentId === '') {
      throw redirect({
        to: '/',
        search: { exams: search.exams },
      })
    }
  },
})

function ProtectedLayout() {
  useSyncExams()

  return (
    <>
      <Outlet />
      <ConfirmIdModal />
    </>
  )
}
