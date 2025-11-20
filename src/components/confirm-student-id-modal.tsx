import { Link, useSearch } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { useState } from 'react'
import { Button } from './ui/button'
import { useLocalStorage } from '@/hooks/use-local-storage'

export function ConfirmStudentIdModal() {
  const [studentIdInLocalStorage, setStudentIdInLocalStorage] = useLocalStorage(
    'student-id',
    ''
  )
  const { studentId: studentIdInSeachParams } = useSearch({
    strict: false,
  })
  const [open, setOpen] = useState(
    studentIdInLocalStorage !== studentIdInSeachParams
  )

  if (!studentIdInSeachParams || !studentIdInLocalStorage) return null

  const handleClose = () => {
    setStudentIdInLocalStorage(studentIdInSeachParams)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            รหัสนิสิตของคุณคือ {studentIdInSeachParams} ใช่หรือไม่?
          </DialogTitle>
          <DialogDescription>
            โปรดตรวจสอบให้แน่ใจว่ารหัสนิสิตของคุณถูกต้องก่อนดำเนินการต่อ
            ไม่เช่นนั้นตารางสอบของคุณอาจไม่ถูกต้อง
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link to="/">นี่ไม่ใช่รหัสนิสิตของฉัน</Link>
          </Button>
          <Button onClick={handleClose}>ถูกต้อง</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
