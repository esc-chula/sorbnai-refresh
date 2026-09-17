import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { mkdtempSync, readFileSync as readTempFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

type Student = {
  id: string
  name: string
  seat: number
  withdrawn: boolean
}

type FinalGroup = {
  building: string
  room: string
  students: number
  student_list: Array<Student>
}

type FinalCourse = {
  date: string
  time: string
  code: string
  title: string
  sum_student: number
  group: Array<FinalGroup>
}

type FinalSchedule = Record<string, FinalCourse>

type ScheduleGroup = {
  building: string
  room: string
  students: number
  range: string
}

type ScheduleCourse = {
  code: string
  title: string
  date: string
  time: string
  sum_student: number
  group: Array<ScheduleGroup>
}

type RosterStudent = {
  id: string
  name?: string
  seat?: number
}

type RosterGroup = {
  building: string
  room: string
  students: number
  student_ids: Array<string>
  student_seats?: Array<RosterStudent>
}

type RosterCourse = {
  code: string
  title: string
  date: string
  time: string
  sum_student: number
  student_ids: Array<string>
  student_count: number
  groups: Array<RosterGroup>
}

type RosterOutput = {
  courses: Record<string, RosterCourse>
}

const root = resolve(__dirname, '..', '..')

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
}

const finalSchedule = readJson<FinalSchedule>('public/sheet.json')
const scheduleByNo = readJson<Record<string, ScheduleCourse>>('sheet-range.json')
const xlsxRoster = readJson<RosterOutput>('course-students.json')
const pdfRoster = readJson<RosterOutput>('course-students-pdf.json')

function scheduleByCode() {
  const result = new Map<string, ScheduleCourse>()
  for (const course of Object.values(scheduleByNo)) {
    if (!result.has(course.code)) {
      result.set(course.code, {
        ...course,
        group: [...course.group],
      })
    } else {
      result.get(course.code)!.group.push(...course.group)
    }
  }
  return result
}

function rosterByCode() {
  return new Map<string, RosterCourse>([
    ...Object.entries(xlsxRoster.courses),
    ...Object.entries(pdfRoster.courses),
  ])
}

function studentNameDirectory() {
  const names = new Map<string, string>()
  for (const roster of [xlsxRoster, pdfRoster]) {
    for (const course of Object.values(roster.courses)) {
      for (const group of course.groups) {
        for (const student of group.student_seats ?? []) {
          if (student.name && !names.has(student.id)) {
            names.set(student.id, student.name)
          }
        }
      }
    }
  }
  return names
}

function expectedStudents(group: RosterGroup, names: Map<string, string>) {
  if (group.student_seats?.length) {
    return group.student_seats.map((student) => ({
      id: student.id,
      name: student.name || names.get(student.id) || '',
      seat: student.seat,
      withdrawn: false,
    }))
  }

  return group.student_ids.map((id, index) => ({
    id,
    name: names.get(id) ?? '',
    seat: index + 1,
    withdrawn: false,
  }))
}

describe('public/sheet.json exam data', () => {
  it('keeps sheet-range.json in sync with the master raw workbook', () => {
    const tempDir = mkdtempSync(resolve(tmpdir(), 'sorbnai-data-'))
    const tempSchedulePath = resolve(tempDir, 'sheet-range.json')

    try {
      execFileSync(
        'py',
        [
          'xlsx-to-range-json.py',
          'src/data/(มีรหัสนิสิต) - ตารางรายวิชาที่จะจัดสอบ Midterm ภาคต้น 69.xlsx',
          tempSchedulePath,
        ],
        { cwd: root, stdio: 'pipe' }
      )

      const regeneratedSchedule = JSON.parse(
        readTempFileSync(tempSchedulePath, 'utf8')
      )

      expect(regeneratedSchedule).toEqual(scheduleByNo)
    } finally {
      rmSync(tempDir, { force: true, recursive: true })
    }
  })

  it('matches the website data schema', () => {
    expect(Array.isArray(finalSchedule)).toBe(false)

    for (const [code, course] of Object.entries(finalSchedule)) {
      expect(typeof code).toBe('string')
      expect(typeof course.date, code).toBe('string')
      expect(typeof course.time, code).toBe('string')
      expect(typeof course.code, code).toBe('string')
      expect(typeof course.title, code).toBe('string')
      expect(typeof course.sum_student, code).toBe('number')
      expect(Array.isArray(course.group), code).toBe(true)

      for (const [groupIndex, group] of course.group.entries()) {
        const groupLabel = `${code} group ${groupIndex}`
        expect(typeof group.building, groupLabel).toBe('string')
        expect(typeof group.room, groupLabel).toBe('string')
        expect(typeof group.students, groupLabel).toBe('number')
        expect(Array.isArray(group.student_list), groupLabel).toBe(true)

        for (const [studentIndex, student] of group.student_list.entries()) {
          const studentLabel = `${groupLabel} student ${studentIndex}`
          expect(typeof student.id, studentLabel).toBe('string')
          expect(typeof student.name, studentLabel).toBe('string')
          expect(typeof student.seat, studentLabel).toBe('number')
          expect(typeof student.withdrawn, studentLabel).toBe('boolean')
        }
      }
    }
  })

  it('contains exactly the courses from the master schedule', () => {
    const expectedCodes = [...scheduleByCode().keys()].sort()
    const actualCodes = Object.keys(finalSchedule).sort()

    expect(actualCodes).toEqual(expectedCodes)
  })

  it('preserves master schedule metadata for every course', () => {
    const source = scheduleByCode()

    for (const [code, expected] of source) {
      const actual = finalSchedule[code]

      expect(actual, code).toBeDefined()
      expect(actual.code, code).toBe(expected.code)
      expect(actual.title, code).toBe(expected.title)
      expect(actual.date, code).toBe(expected.date)
      expect(actual.time, code).toBe(expected.time)

      if (!pdfRoster.courses[code]) {
        expect(actual.sum_student, code).toBe(expected.sum_student)
      }
    }
  })

  it('keeps schedule-only courses aligned with the master room rows', () => {
    const schedule = scheduleByCode()
    const rosters = rosterByCode()

    for (const [code, expectedCourse] of schedule) {
      if (rosters.has(code)) continue

      const actual = finalSchedule[code]
      expect(actual.group, code).toHaveLength(expectedCourse.group.length)

      for (const [index, expectedGroup] of expectedCourse.group.entries()) {
        const actualGroup = actual.group[index]
        expect(actualGroup, `${code} group ${index}`).toMatchObject({
          building: expectedGroup.building,
          room: expectedGroup.room,
          students: expectedGroup.students,
          student_list: [],
        })
      }
    }
  })

  it('keeps roster-backed room, seat, student, and name details aligned', () => {
    const rosters = rosterByCode()
    const names = studentNameDirectory()

    for (const [code, expectedCourse] of rosters) {
      const actual = finalSchedule[code]
      expect(actual, code).toBeDefined()
      expect(actual.group, code).toHaveLength(expectedCourse.groups.length)

      for (const [index, expectedGroup] of expectedCourse.groups.entries()) {
        const actualGroup = actual.group[index]
        const detail = `${code} ${expectedGroup.building}/${expectedGroup.room}`

        expect(actualGroup.building, detail).toBe(expectedGroup.building)
        expect(actualGroup.room, detail).toBe(expectedGroup.room)
        expect(actualGroup.students, detail).toBe(expectedGroup.students)
        expect(actualGroup.student_list, detail).toEqual(
          expectedStudents(expectedGroup, names)
        )
      }
    }
  })

  it('does not create duplicate student IDs within a course', () => {
    for (const [code, course] of Object.entries(finalSchedule)) {
      const ids = course.group.flatMap((group) =>
        group.student_list.map((student) => student.id)
      )
      expect(new Set(ids).size, code).toBe(ids.length)
    }
  })

  it('has sequential fallback seats when the source roster has no explicit seats', () => {
    for (const [code, course] of Object.entries(finalSchedule)) {
      for (const group of course.group) {
        const seats = group.student_list.map((student) => student.seat)
        if (!seats.length) continue

        const expectedSeats = Array.from(
          { length: seats.length },
          (_, index) => index + 1
        )
        const rosterGroup = rosterByCode()
          .get(code)
          ?.groups.find(
            (candidate) =>
              candidate.building === group.building &&
              candidate.room === group.room
          )

        if (!rosterGroup?.student_seats?.length) {
          expect(seats, `${code} ${group.building}/${group.room}`).toEqual(
            expectedSeats
          )
        }
      }
    }
  })
})
