import { parse } from 'date-fns'

export function getDate({
  date,
  time,
}: {
  date: string
  time: string
}): [Date, Date] {
  return time.split('-').map((t) => {
    return parse(`${date} ${t}`, 'EEE dd MMM yy HH:mm', new Date())
  }) as [Date, Date]
}
