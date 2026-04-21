import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { AddToCalendarButton } from './add-to-calendar-button'
import type { StudentExam } from '@/types/class'
import { getDate } from '@/lib/filters'

type Props = {
  exams: Array<StudentExam>
}

export function ExamTable({ exams }: Props) {
  const rows = useMemo(() => {
    return [...exams]
      .map((exam) => ({
        ...exam,
        _start: getDate({ date: exam.date, time: exam.time })[0],
      }))
      .sort((a, b) => a._start.getTime() - b._start.getTime())
  }, [exams])

  if (rows.length === 0) {
    return (
      <div className="text-muted-foreground w-full rounded-lg border bg-white p-6 text-center text-sm">
        ไม่มีวิชาที่ต้องสอบ
      </div>
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="flex w-full flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.code}
            className="flex flex-col gap-3 rounded-lg border bg-white px-5 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-esc-carmine-500 min-w-0 font-bold">
                <div>{row.code}</div>
                <div className="text-sm">{row.title}</div>
              </div>
              <AddToCalendarButton exam={row} />
            </div>
            <dl className="text-esc-carmine-500 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">วันสอบ</dt>
              <dd>{format(row._start, 'eee dd MMM yy', { locale: th })}</dd>
              <dt className="text-muted-foreground">เวลา</dt>
              <dd>{row.time}</dd>
              <dt className="text-muted-foreground">เลขที่ห้องสอบ</dt>
              <dd>
                {row.group.building} ห้อง {row.group.room}
              </dd>
              <dt className="text-muted-foreground">เลขที่นั่งสอบ</dt>
              <dd>{row.seat}</dd>
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden w-full overflow-hidden rounded-lg border bg-white md:block">
        <Table className="[&_td]:px-4 [&_th]:px-4 [&_td:first-child]:pl-6 [&_th:first-child]:pl-6 [&_td:last-child]:pr-6 [&_th:last-child]:pr-6">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อย่อรายวิชา</TableHead>
              <TableHead>วันสอบ</TableHead>
              <TableHead>เวลาสอบ</TableHead>
              <TableHead>อาคาร</TableHead>
              <TableHead>ห้อง</TableHead>
              <TableHead className="text-center">ที่นั่ง</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody className="text-esc-carmine-500">
            {rows.map((row) => (
              <TableRow key={row.code}>
                <TableCell className="font-bold">{row.code}</TableCell>
                <TableCell className="font-bold">{row.title}</TableCell>
                <TableCell>
                  {format(row._start, 'eee dd MMM yy', { locale: th })}
                </TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.group.building}</TableCell>
                <TableCell>{row.group.room}</TableCell>
                <TableCell className="text-center">{row.seat}</TableCell>
                <TableCell className="text-right">
                  <AddToCalendarButton exam={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
