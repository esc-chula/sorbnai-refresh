import z from 'zod'

const studentSchema = z.object({
  id: z.string(),
  name: z.string(),
  seat: z.number(),
  withdrawn: z.boolean(),
})

const baseExamClassSchema = z.object({
  date: z.string(),
  time: z.string(),
  code: z.string(),
  title: z.string(),
  sum_student: z.number(),
})
const groupSchema = z.object({
  building: z.string(),
  room: z.string(),
  students: z.number(),
  student_list: z.array(studentSchema),
})
const examClassSchema = baseExamClassSchema.extend({
  group: z.array(groupSchema),
})
const studentExamSchema = baseExamClassSchema.extend({
  group: groupSchema,
  seat: z.number(),
})
const examScheduleSchema = z.record(z.string(), examClassSchema)

type Student = z.infer<typeof studentSchema>
type Group = z.infer<typeof groupSchema>
type ExamClass = z.infer<typeof examClassSchema>
type ExamSchedule = z.infer<typeof examScheduleSchema>
type StudentExam = z.infer<typeof studentExamSchema>

export {
  studentSchema,
  groupSchema,
  examClassSchema,
  examScheduleSchema,
  studentExamSchema,
}
export type { Student, Group, ExamClass, ExamSchedule, StudentExam }
