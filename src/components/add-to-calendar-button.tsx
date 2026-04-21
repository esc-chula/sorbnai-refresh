import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { google, ics, outlook } from 'calendar-link'
import { Calendar } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
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
import type { CalendarEvent } from 'calendar-link'
import type { StudentExam } from '@/types/class'
import { getDate } from '@/lib/filters'

type Props = {
  exam: Pick<
    StudentExam,
    'date' | 'time' | 'title' | 'code' | 'group' | 'seat'
  >
}

export function AddToCalendarButton({ exam }: Props) {
  const { date, time, title, code, group } = exam
  const [start, end] = useMemo(() => getDate({ date, time }), [date, time])

  const event: CalendarEvent = useMemo(
    () => ({
      title: `${code} ${title}`,
      start,
      end,
      location: `อาคาร ${group.building} ห้อง ${group.room}`,
    }),
    [code, title, start, end, group.building, group.room]
  )

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-foreground gap-1.5 bg-white font-normal"
        >
          <Calendar className="size-4" />
          เพิ่มลงปฏิทิน
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
  )
}
