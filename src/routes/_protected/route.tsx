import { ConfirmStudentIdModal } from '@/components/confirm-student-id-modal'
import { useSyncSelectedClasses } from '@/hooks/use-sync-selected-classes'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import z from 'zod'

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
  selectedClasses: z.array(z.string()).catch([]),
})

export const Route = createFileRoute('/_protected')({
  component: RouteComponent,
  validateSearch: searchSchema,
})

function RouteComponent() {
  useSyncSelectedClasses()

  return (
    <>
      <Outlet />
      <ConfirmStudentIdModal />
    </>
  )
}
