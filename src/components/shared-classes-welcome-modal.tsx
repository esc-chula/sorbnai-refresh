import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface SharedClassesWelcomeModalProps {
  open: boolean
  onClose: () => void
  classCount: number
}

export function SharedClassesWelcomeModal({
  open,
  onClose,
  classCount,
}: SharedClassesWelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>กรุณากรอกรหัสนิสิตของคุณ</DialogTitle>
          <DialogDescription>
            มีวิชาที่ถูกแชร์ให้คุณทั้งหมด {classCount} วิชา
            กรอกรหัสนิสิตของคุณเพื่อดูตารางสอบได้เลย
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>เข้าใจแล้ว</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
