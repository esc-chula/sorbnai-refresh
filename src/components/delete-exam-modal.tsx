import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface DeleteExamModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  classCode: string
  classTitle: string
}

export function DeleteExamModal({
  open,
  onClose,
  onConfirm,
  classCode,
  classTitle,
}: DeleteExamModalProps) {
  const confirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบวิชา</DialogTitle>
          <DialogDescription>
            คุณต้องการลบ {classCode} {classTitle} ออกจากรายการหรือไม่?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={confirm}>
            ลบวิชา
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
