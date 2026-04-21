import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'
import { ConfirmIdModal } from '@/components/confirm-id-modal'

const searchSchema = z.object({
  studentId: z
    .string()
    .length(10, { message: 'Student ID must be 10 characters long' })
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Student ID must be only digits',
    })
    .catch(''),
})

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    if (!search.studentId || search.studentId === '') {
      throw redirect({
        to: '/',
      })
    }
  },
})

function ProtectedLayout() {
  return (
    <>
      <Outlet />
      <ConfirmIdModal />
    </>
  )
}
