import { Link, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { useLocalStorage } from '@/hooks/use-local-storage'

export function ConfirmIdModal() {
  const [storedId, setStoredId] = useLocalStorage('student-id', '')
  const { studentId: urlId, exams } = useSearch({
    strict: false,
  })
  const [open, setOpen] = useState(storedId !== urlId)

  if (!urlId || !storedId) return null

  const confirm = () => {
    setStoredId(urlId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>รหัสนิสิตของคุณคือ {urlId} ใช่หรือไม่?</DialogTitle>
          <DialogDescription>
            โปรดตรวจสอบให้แน่ใจว่ารหัสนิสิตของคุณถูกต้องก่อนดำเนินการต่อ
            ไม่เช่นนั้นตารางสอบของคุณอาจไม่ถูกต้อง
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link to="/" search={{ exams: exams ?? [] }}>
              นี่ไม่ใช่รหัสนิสิตของฉัน
            </Link>
          </Button>
          <Button onClick={confirm}>ถูกต้อง</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
