import z from 'zod'

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
  range: z.string(),
})
const examClassSchema = baseExamClassSchema.extend({
  group: z.array(groupSchema),
})
const studentExamSchema = baseExamClassSchema.extend({
  group: groupSchema,
})
const examScheduleSchema = z.record(z.string(), examClassSchema)

type Group = z.infer<typeof groupSchema>
type ExamClass = z.infer<typeof examClassSchema> & { inRange?: boolean }
type ExamSchedule = z.infer<typeof examScheduleSchema>
type StudentExam = z.infer<typeof studentExamSchema> & { inRange?: boolean }

export { groupSchema, examClassSchema, examScheduleSchema, studentExamSchema }
export type { Group, ExamClass, ExamSchedule, StudentExam }
