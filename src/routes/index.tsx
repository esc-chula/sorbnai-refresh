import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getRouter } from '@/router'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { SharedClassesWelcomeModal } from '@/components/shared-classes-welcome-modal'
import { useEffect, useState } from 'react'

const searchSchema = z.object({
  selectedClasses: z.array(z.string()).catch([]),
})

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: searchSchema,
})

const formSchema = z.object({
  studentId: z
    .string()
    .length(10, { message: 'Student ID must be 10 characters long' })
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Student ID must be only digits',
    })
    .refine((val) => val.endsWith('21'), {
      message: 'Student ID must end with 21',
    }),
})

function App() {
  const { selectedClasses } = Route.useSearch()
  const [studentIdInStorage, setStudentIdInStorage] = useLocalStorage(
    'student-id',
    ''
  )
  const [selectedClassesInStorage, setSelectedClassesInStorage] =
    useLocalStorage<string[]>('selected-classes', [])
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    if (
      studentIdInStorage &&
      selectedClasses &&
      selectedClasses.length > 0 &&
      formSchema.safeParse({ studentId: studentIdInStorage }).success
    ) {
      const mergedClasses = Array.from(
        new Set([...selectedClassesInStorage, ...selectedClasses])
      )
      setSelectedClassesInStorage(mergedClasses)
      getRouter().navigate({
        to: '/schedule',
        search: {
          studentId: studentIdInStorage,
          selectedClasses: mergedClasses,
        },
      })
    } else if (selectedClasses && selectedClasses.length > 0) {
      setSelectedClassesInStorage(selectedClasses)
      setShowWelcomeModal(true)
    }
  }, [
    selectedClasses,
    studentIdInStorage,
    setSelectedClassesInStorage,
    selectedClassesInStorage,
  ])

  const form = useForm({
    defaultValues: {
      studentId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      setStudentIdInStorage(value.studentId)
      getRouter().navigate({
        to: '/select-classes',
        search: {
          selectedClasses: selectedClasses ?? [],
          studentId: value.studentId,
        },
      })
    },
  })

  return (
    <>
      <Card className="m-auto w-full sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tighter">
            เข้าสู่ระบบ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="student-id-form"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="studentId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>เลขนิสิต</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="กรอกเลขนิสิตของคุณ"
                      autoComplete="student-id"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="student-id-form"
            size="lg"
            className="w-full"
          >
            เข้าสู่ระบบ
          </Button>
        </CardFooter>
      </Card>
      <SharedClassesWelcomeModal
        open={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        classCount={selectedClasses?.length ?? 0}
      />
    </>
  )
}
