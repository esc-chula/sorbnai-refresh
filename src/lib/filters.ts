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

export function getUpcomingAndPastClasses<
  T extends { date: string; time: string },
>(
  classes: T[]
): {
  upcomingClasses: T[]
  pastClasses: T[]
} {
  const now = new Date()
  classes.sort((a, b) => compareAsc(getDate(a)[0], getDate(b)[0]))

  const upcoming: T[] = []
  const past: T[] = []

  classes.forEach((c) => {
    getDate(c)[0] >= now ? upcoming.push(c) : past.push(c)
  })

  return { upcomingClasses: upcoming, pastClasses: past }
}
