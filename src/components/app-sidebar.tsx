import { LogIn, LogOut, Search, Table, User, X } from 'lucide-react'
import { Link, useSearch } from '@tanstack/react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { getRouter } from '@/router'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/use-local-storage'

export function AppSidebar() {
  const { studentId, exams } = useSearch({
    strict: false,
  })
  const [_, setStoredId] = useLocalStorage('student-id', '')
  const { toggleSidebar, isMobile } = useSidebar()

  const logout = () => {
    setStoredId('')
    getRouter().navigate({
      to: '/',
      search: {
        exams: [],
      },
    })
  }

  if (!isMobile) {
    return null
  }

  return (
    <Sidebar side="right">
      <SidebarContent className="px-4 pt-8">
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="text-primary gap-2 text-2xl font-semibold">
              <img src="/logo.svg" alt="logo" />
              <span>สอบไหน</span>
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <X className="size-5" />
              <span className="sr-only">ปิดเมนู</span>
            </Button>
          </div>
          {studentId ? (
            <SidebarGroupContent className="mt-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <User />
                    <span>{studentId}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/select-exams"
                      search={{
                        studentId,
                        exams: exams ?? [],
                      }}
                    >
                      <Search />
                      <span>ค้นหาวิชาเรียน</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/schedule"
                      search={{
                        studentId,
                        exams: exams ?? [],
                      }}
                    >
                      <Table />
                      <span>ห้องสอบ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          ) : null}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentId ? (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout}>
                    <LogOut />
                    <span>ออกจากระบบ</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/" search={{ exams: exams ?? [] }}>
                      <LogIn />
                      <span>เข้าสู่ระบบ</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
