import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import z from 'zod'
import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getRouter } from '@/router'
import { useLocalStorage } from '@/hooks/use-local-storage'

export const Route = createFileRoute('/')({
  component: App,
})

const formSchema = z.object({
  studentId: z
    .string()
    .length(10, { message: 'Student ID must be 10 characters long' })
    .refine((val) => /^\d{10}$/.test(val), {
      message: 'Student ID must be only digits',
    }),
})

function App() {
  const [storedId] = useLocalStorage('student-id', '')

  useEffect(() => {
    if (storedId && formSchema.safeParse({ studentId: storedId }).success) {
      getRouter().navigate({
        to: '/schedule',
        search: {
          studentId: storedId,
        },
      })
    }
  }, [])

  const form = useForm({
    defaultValues: {
      studentId: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      getRouter().navigate({
        to: '/schedule',
        search: {
          studentId: value.studentId,
        },
      })
    },
  })

  return (
    <div className="m-auto w-full max-w-md px-4 sm:px-0">
      <Card className="w-full">
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
    </div>
  )
}
