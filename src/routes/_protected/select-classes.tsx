import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { thaiExamRoomsQueryOptions } from '@/data/thai-exam-rooms'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { FileWarningIcon, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import Fuse from 'fuse.js'
import { ThaiClasses } from '@/components/thai-classes'

export type ShowMode = 'all' | 'in-range'
export type TabMode = 'thai' | 'ise'

export const Route = createFileRoute('/_protected/select-classes')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { studentId, selectedClasses } = Route.useSearch()
  const { data: thaiExamRooms } = useSuspenseQuery(
    thaiExamRoomsQueryOptions(studentId)
  )
  const [showMode, setShowMode] = useState<ShowMode>('in-range')
  const thaiClasses = useMemo(
    () =>
      thaiExamRooms.filter(
        ({ code, inRange }) =>
          selectedClasses.includes(code) || showMode !== 'in-range' || inRange
      ),
    [thaiExamRooms, selectedClasses, showMode]
  )
  const fuse = useMemo(
    () =>
      new Fuse(thaiClasses, {
        keys: ['code', 'title'],
        threshold: 0.3,
      }),
    [thaiClasses]
  )

  const [search, setSearch] = useState<string>('')
  const [tab, setTab] = useLocalStorage<TabMode>('tab', 'thai', {
    initializeWithValue: false,
  })
  const [_, setSelectedClassesLocal] = useLocalStorage<string[]>(
    'selected-classes',
    [],
    { initializeWithValue: false }
  )

  const setSelectedClasses = (classes: string[]) => {
    setSelectedClassesLocal(classes)
    navigate({
      search: (old) => ({
        ...old,
        selectedClasses: classes,
      }),
    })
  }

  const searchedThaiClasses = useMemo(() => {
    if (!search) return thaiClasses
    return fuse.search(search).map(({ item }) => item)
  }, [fuse, search, thaiClasses])

  if (!studentId) {
    return (
      <Empty className="bg-background m-auto w-full shadow sm:max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarningIcon />
          </EmptyMedia>
          <EmptyTitle>Invalid Student ID</EmptyTitle>
          <EmptyDescription>
            Please go back and enter a valid Student ID to select classes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/" className="w-full">
              Go Back to Login
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="m-auto flex w-full flex-col items-center gap-4 p-4 sm:max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            โปรดเลือกวิชาที่คุณลงทะเบียน
          </CardTitle>
        </CardHeader>
        <CardContent className="flex w-full flex-col items-center gap-4">
          <div className="relative flex w-full items-center">
            <Search className="text-muted-foreground absolute top-1/2 left-2 size-5 -translate-y-1/2" />
            <Input
              placeholder="ค้นหาวิชา ด้วยรหัสวิชาหรือชื่อวิชา"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Tabs
            className="w-full"
            defaultValue="thai"
            value={tab}
            onValueChange={(val) => setTab(val as TabMode)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="thai">ภาคไทย</TabsTrigger>
              <TabsTrigger value="ise" disabled>
                ISE (soon)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="thai">
              <ThaiClasses
                classes={searchedThaiClasses}
                selectedClasses={selectedClasses}
                setSelectedClasses={setSelectedClasses}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex w-full flex-col items-start gap-4">
          <div
            className={cn(
              'flex items-center space-x-2',
              tab === 'ise' && 'hidden'
            )}
          >
            <Switch
              id="show-mode"
              checked={showMode === 'in-range'}
              onCheckedChange={(checked) => {
                setShowMode(checked ? 'in-range' : 'all')
              }}
            />
            <Label htmlFor="show-mode">
              {showMode === 'in-range'
                ? 'แสดงเฉพาะวิชาที่เลขนิสิตของคุณอยู่ในช่วง'
                : 'แสดงวิชาทั้งหมด'}
            </Label>
          </div>
          <Button className="w-full" size="lg" asChild>
            <Link to="/schedule" search={{ studentId, selectedClasses }}>
              ดำเนินการต่อ
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
