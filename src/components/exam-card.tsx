import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { th } from 'date-fns/locale'
import { google, ics, outlook } from 'calendar-link'
import { Calendar, X } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer'
import { GoogleCalendarIcon } from './logos/google-calendar'
import { AppleLogo } from './logos/apple'
import { OutlookLogo } from './logos/outlook'
import { DeleteExamModal } from './delete-exam-modal'
import type { CalendarEvent } from 'calendar-link'
import type { StudentExam } from '@/types/class'
import { getDate } from '@/lib/filters'

type ExamCardProps = {
  class: Pick<StudentExam, 'date' | 'time' | 'title' | 'code' | 'group'>
  onDelete?: (classCode: string) => void
}

export function ExamCard({
  class: { date, time, title, code, group },
  onDelete,
}: ExamCardProps) {
  const [start, end] = useMemo(() => getDate({ date, time }), [date, time])
  const [deleteOpen, setDeleteOpen] = useState(false)

  const event: CalendarEvent = useMemo(
    () => ({
      title: `${code} ${title}`,
      start,
      end,
      location: `อาคาร ${group.building} ห้อง ${group.room}`,
    }),
    []
  )

  const deleteExam = () => {
    if (onDelete) {
      onDelete(code)
    }
  }

  return (
    <div className="border-border group relative flex size-full flex-col gap-1 rounded-lg border px-6 py-2.5 text-base shadow-sm">
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive absolute top-2 right-2 size-6 opacity-100 transition-all md:opacity-0 md:group-hover:opacity-100"
          onClick={() => setDeleteOpen(true)}
        >
          <X className="size-4" />
        </Button>
      )}
      <h2 className="text-esc-carmine-500 w-full font-semibold">
        {code} {title}
      </h2>
      <div className="[&>*:nth-child(odd)]:text-muted-foreground [&>*:nth-child(even)]:text-esc-carmine-400 grid grid-cols-[auto_minmax(0,1fr)] gap-2 text-sm [&>*:nth-child(even)]:font-semibold">
        <p>วันที่:</p>
        <p>
          {format(start, 'eee dd MMM yyyy', {
            locale: th,
          })}
        </p>
        <p>เวลา:</p>
        <p>
          {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
        </p>
        <p>อาคาร:</p>
        <p>{group.building}</p>
        <p>ห้อง:</p>
        <p>{group.room}</p>
        <p>กลุ่ม:</p>
        <p>{group.range}</p>
      </div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full">
            <Calendar />
            เพิ่มลงในปฏิทิน
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>เพิ่ม {title} ลงในปฏิทิน</DrawerTitle>
            <DrawerDescription>
              {format(event.start, 'eeee d MMM yyyy เวลา HH:mm', {
                locale: th,
              })}{' '}
              -{' '}
              {format(event.end, 'HH:mm', {
                locale: th,
              })}
              <br />
              {event.location}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to={google(event)} target="_blank">
                <GoogleCalendarIcon className="size-4" /> Google Calendar
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to={ics(event)} target="_blank">
                <AppleLogo className="size-4" /> Apple Calendar (ICS)
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to={outlook(event)} target="_blank">
                <OutlookLogo className="size-4" /> Outlook
              </Link>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {onDelete && (
        <DeleteExamModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={deleteExam}
          classCode={code}
          classTitle={title}
        />
      )}
    </div>
  )
}
