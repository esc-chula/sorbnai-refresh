import { compareAsc, parse } from 'date-fns'

// "date": "Fri 28 Nov 25",
// "time": "08:30-11:30",

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

export function splitExamsByDate<T extends { date: string; time: string }>(
  exams: Array<T>
): {
  upcoming: Array<T>
  past: Array<T>
} {
  const now = new Date()
  exams.sort((a, b) => compareAsc(getDate(a)[0], getDate(b)[0]))

  const upcoming: Array<T> = []
  const past: Array<T> = []

  exams.forEach((c) => {
    getDate(c)[0] >= now ? upcoming.push(c) : past.push(c)
  })

  return { upcoming, past }
}
