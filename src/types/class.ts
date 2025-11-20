import z from 'zod'

const baseClassInfoSchema = z.object({
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
const classInfoSchema = baseClassInfoSchema.extend({
  group: z.array(groupSchema),
})
const myClassInfoSchema = baseClassInfoSchema.extend({
  group: groupSchema,
})
const classScheduleSchema = z.record(z.string(), classInfoSchema)

type Group = z.infer<typeof groupSchema>
type ClassInfo = z.infer<typeof classInfoSchema>
type ClassSchedule = z.infer<typeof classScheduleSchema>
type MyClassInfo = z.infer<typeof myClassInfoSchema>
interface ClassInfoWithInRange extends ClassInfo {
  inRange: boolean
}
interface MyClassInfoWithInRange extends MyClassInfo {
  inRange: boolean
}

export { groupSchema, classInfoSchema, classScheduleSchema, myClassInfoSchema }
export type {
  Group,
  ClassInfo,
  ClassSchedule,
  MyClassInfo,
  ClassInfoWithInRange,
  MyClassInfoWithInRange,
}
