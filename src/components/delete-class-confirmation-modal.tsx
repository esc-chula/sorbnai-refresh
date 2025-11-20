import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface DeleteClassConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  classCode: string
  classTitle: string
}

export function DeleteClassConfirmationModal({
  open,
  onClose,
  onConfirm,
  classCode,
  classTitle,
}: DeleteClassConfirmationModalProps) {
  const handleConfirm = () => {
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
          <Button variant="destructive" onClick={handleConfirm}>
            ลบวิชา
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
