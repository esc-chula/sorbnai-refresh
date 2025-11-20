import { Link, useSearch } from '@tanstack/react-router'
import { ChevronDown, LogIn, LogOut, Search, Table, User } from 'lucide-react'
import { SidebarTrigger } from './ui/sidebar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { getRouter } from '@/router'

export function Header() {
  const { studentId, selectedClasses } = useSearch({ strict: false })

  const handleLogout = () => {
    getRouter().navigate({ to: '/' })
  }

  return (
    <header className="bg-card sticky top-0 z-50 flex w-full px-4 py-5 shadow-md">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
        <img src="/logo.svg" alt="logo" className="shrink-0" />

        <nav className="hidden items-center gap-2 md:flex">
          {studentId ? (
            <>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link
                  to="/select-classes"
                  search={{ studentId, selectedClasses: selectedClasses ?? [] }}
                >
                  <Search className="size-4" />
                  <span>ค้นหาวิชาเรียน</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link
                  to="/schedule"
                  search={{ studentId, selectedClasses: selectedClasses ?? [] }}
                >
                  <Table className="size-4" />
                  <span>ห้องสอบ</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="size-4" />
                    <span>{studentId}</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="size-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/">
                <LogIn className="size-4" />
                <span>เข้าสู่ระบบ</span>
              </Link>
            </Button>
          )}
        </nav>

        <SidebarTrigger className="md:hidden" />
      </div>
    </header>
  )
}
