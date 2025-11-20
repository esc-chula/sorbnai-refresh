import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { thaiMyExamRoomsQueryOptions } from '@/data/thai-exam-rooms'
import { getUpcomingAndPastClasses } from '@/lib/filters'
import { ClassCard } from '@/components/class-card'
import { ShareScheduleButton } from '@/components/share-schedule-button'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { getRouter } from '@/router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_protected/schedule')({
  component: RouteComponent,
})

function RouteComponent() {
  const { studentId, selectedClasses } = Route.useSearch()
  const [, setSelectedClassesInStorage] = useLocalStorage<string[]>(
    'selected-classes',
    []
  )
  const { data: thaiExamRooms } = useSuspenseQuery(
    thaiMyExamRoomsQueryOptions(studentId)
  )
  const { upcomingClasses, pastClasses } = getUpcomingAndPastClasses(
    thaiExamRooms.filter((room) => selectedClasses.includes(room.code))
  )
  const noDataClasses = selectedClasses.filter(
    (code) => !thaiExamRooms.some((room) => room.code === code)
  )

  if (!studentId) {
    throw new Error('Student ID is required')
  }

  const handleDeleteClass = (classCode: string) => {
    const updatedClasses = selectedClasses.filter((code) => code !== classCode)
    setSelectedClassesInStorage(updatedClasses)
    getRouter().navigate({
      to: '/schedule',
      search: {
        studentId,
        selectedClasses: updatedClasses,
      },
    })
    toast.success('ลบวิชาเรียบร้อยแล้ว')
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
                {upcomingClasses.length > 0 ? (
                  upcomingClasses.map((c) => (
                    <ClassCard
                      key={
                        c.code + c.title.replaceAll(/\s/g, '-').toLowerCase()
                      }
                      class={c}
                      onDelete={handleDeleteClass}
                    />
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
                {pastClasses.length > 0 ? (
                  pastClasses.map((c) => (
                    <ClassCard
                      key={
                        c.code + c.title.replaceAll(/\s/g, '-').toLowerCase()
                      }
                      class={c}
                      onDelete={handleDeleteClass}
                    />
                  ))
                ) : (
                  <span>ไม่มีวิชาที่สอบไปแล้ว</span>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>
        {noDataClasses.length > 0 && (
          <Card className="w-full">
            <AccordionItem value="no-data" className="w-full">
              <CardHeader>
                <AccordionTrigger>
                  <CardTitle className="text-base">ไม่มีข้อมูล</CardTitle>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="flex w-full flex-col gap-2 overflow-auto">
                  {noDataClasses.map((classInfo) => (
                    <div
                      key={classInfo}
                      className="border-border group relative flex items-center justify-between rounded-lg border px-4 py-2 shadow-sm"
                    >
                      <span>{classInfo}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClass(classInfo)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ลบ
                      </Button>
                    </div>
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
      <ShareScheduleButton selectedClasses={selectedClasses} />
      <Button asChild size="lg" className="w-full">
        <Link
          to="/select-classes"
          search={{
            studentId,
            selectedClasses,
          }}
        >
          เลือกวิชาเพิ่ม
        </Link>
      </Button>
    </div>
  )
}
