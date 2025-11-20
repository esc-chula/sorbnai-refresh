import { Link, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { studentExamsQuery } from '@/data/thai-exam-rooms'
import { splitExamsByDate } from '@/lib/filters'
import { ExamCard } from '@/components/exam-card'
import { ShareButton } from '@/components/share-button'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getRouter } from '@/router'

export const Route = createFileRoute('/_protected/schedule')({
  component: Schedule,
})

function Schedule() {
  const { studentId, exams } = Route.useSearch()
  const [, setStoredExams] = useLocalStorage<Array<string>>(
    'selected-exams',
    []
  )
  const [deletingExam, setDeletingExam] = useState<string | null>(null)
  const { data: examRooms } = useSuspenseQuery(studentExamsQuery(studentId))
  const { upcoming, past } = splitExamsByDate(
    examRooms.filter((room) => exams.includes(room.code))
  )
  const unknownExams = exams.filter(
    (code) => !examRooms.some((room) => room.code === code)
  )

  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const deleteExam = (classCode: string) => {
    setDeletingExam(classCode)
    setTimeout(() => {
      const updatedExams = exams.filter((code) => code !== classCode)
      setStoredExams(updatedExams)
      getRouter().navigate({
        to: '/schedule',
        search: {
          studentId,
          exams: updatedExams,
        },
      })
      setDeletingExam(null)
    }, 400)
  }

  return (
    <div className="m-auto flex w-full flex-col items-center gap-4 p-4 sm:max-w-4xl">
      <Accordion
        type="multiple"
        className="flex w-full flex-col gap-4"
        defaultValue={['upcoming']}
      >
        <Card className="w-full">
          <AccordionItem value="upcoming" className="w-full">
            <CardHeader>
              <AccordionTrigger>
                <CardTitle className="text-base">วิชาที่กำลังจะสอบ</CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="flex w-full flex-col gap-2 overflow-auto">
                {upcoming.length > 0 ? (
                  upcoming.map((c) => (
                    <motion.div
                      key={
                        c.code + c.title.replaceAll(/\s/g, '-').toLowerCase()
                      }
                      initial={{ opacity: 1, scale: 1, height: 'auto' }}
                      animate={
                        deletingExam === c.code
                          ? {
                              opacity: 0,
                              scale: 0.8,
                              height: 0,
                              marginTop: 0,
                              marginBottom: 0,
                            }
                          : { opacity: 1, scale: 1, height: 'auto' }
                      }
                      transition={{ duration: 0.4 }}
                    >
                      <ExamCard class={c} onDelete={deleteExam} />
                    </motion.div>
                  ))
                ) : (
                  <span>ไม่มีวิชาที่กำลังจะสอบ</span>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        <Card className="w-full">
          <AccordionItem value="past" className="w-full">
            <CardHeader>
              <AccordionTrigger>
                <CardTitle className="text-base">วิชาที่สอบไปแล้ว</CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="flex w-full flex-col gap-2 overflow-auto">
                {past.length > 0 ? (
                  past.map((c) => (
                    <motion.div
                      key={
                        c.code + c.title.replaceAll(/\s/g, '-').toLowerCase()
                      }
                      initial={{ opacity: 1, scale: 1, height: 'auto' }}
                      animate={
                        deletingExam === c.code
                          ? {
                              opacity: 0,
                              scale: 0.8,
                              height: 0,
                              marginTop: 0,
                              marginBottom: 0,
                            }
                          : { opacity: 1, scale: 1, height: 'auto' }
                      }
                      transition={{ duration: 0.4 }}
                    >
                      <ExamCard class={c} onDelete={deleteExam} />
                    </motion.div>
                  ))
                ) : (
                  <span>ไม่มีวิชาที่สอบไปแล้ว</span>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>
        {unknownExams.length > 0 && (
          <Card className="w-full">
            <AccordionItem value="no-data" className="w-full">
              <CardHeader>
                <AccordionTrigger>
                  <CardTitle className="text-base">ไม่มีข้อมูล</CardTitle>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="flex w-full flex-col gap-2 overflow-auto">
                  {unknownExams.map((classInfo) => (
                    <motion.div
                      key={classInfo}
                      initial={{ opacity: 1, scale: 1, height: 'auto' }}
                      animate={
                        deletingExam === classInfo
                          ? {
                              opacity: 0,
                              scale: 0.8,
                              height: 0,
                              marginTop: 0,
                              marginBottom: 0,
                            }
                          : { opacity: 1, scale: 1, height: 'auto' }
                      }
                      transition={{ duration: 0.4 }}
                      className="border-border group relative flex items-center justify-between rounded-lg border px-4 py-2 shadow-sm"
                    >
                      <span>{classInfo}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExam(classInfo)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ลบ
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
                <CardFooter>
                  <span className="text-muted-foreground text-sm">
                    ทางเราไม่มีข้อมูลการสอบสำหรับวิชาเหล่านี้ของคุณ
                  </span>
                </CardFooter>
              </AccordionContent>
            </AccordionItem>
          </Card>
        )}
      </Accordion>
      <ShareButton selected={exams} />
      <Button asChild size="lg" className="w-full">
        <Link
          to="/select-exams"
          search={{
            studentId,
            exams,
          }}
        >
          เลือกวิชาเพิ่ม
        </Link>
      </Button>
    </div>
  )
}
