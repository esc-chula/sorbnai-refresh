import { format } from 'date-fns'
import { useMemo } from 'react'
import { th } from 'date-fns/locale'
import { google, ics, type CalendarEvent, outlook } from 'calendar-link'
import { Button } from './ui/button'
import { Calendar } from 'lucide-react'
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
import { Link } from '@tanstack/react-router'
import { AppleLogo } from './logos/apple'
import { OutlookLogo } from './logos/outlook'
import { MyClassInfo } from '@/types/class'
import { getDate } from '@/lib/filters'

type ExamCardProps = {
  class: Pick<MyClassInfo, 'date' | 'time' | 'title' | 'code' | 'group'>
}

export function ClassCard({
  class: { date, time, title, code, group },
}: ExamCardProps) {
  const [start, end] = useMemo(() => getDate({ date, time }), [date, time])

  const event: CalendarEvent = useMemo(
    () => ({
      title: `${code} ${title}`,
      start,
      end,
      location: `อาคาร ${group.building} ห้อง ${group.room}`,
    }),
    []
  )

  return (
    <div className="border-border group flex size-full flex-col gap-1 rounded-lg border px-6 py-2.5 text-base shadow-sm">
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
    </div>
  )
}
