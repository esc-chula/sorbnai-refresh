import { Button } from './ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface ShareScheduleButtonProps {
  selectedClasses: string[]
}

export function ShareScheduleButton({
  selectedClasses,
}: ShareScheduleButtonProps) {
  const handleShare = async () => {
    const url = new URL(window.location.origin)
    url.searchParams.set('selectedClasses', JSON.stringify(selectedClasses))

    const shareData = {
      title: 'สอบไหน - ตารางสอบของฉัน',
      text: `แชร์รายวิชาที่เลือก ${selectedClasses.length} วิชา`,
      url: url.toString(),
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        toast.success('แชร์สำเร็จ')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('ไม่สามารถแชร์ได้')
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url.toString())
        toast.success('คัดลอกลิงก์แล้ว', {
          description: 'นำลิงก์ไปแชร์ให้เพื่อนได้เลย',
        })
      } catch (error) {
        toast.error('ไม่สามารถคัดลอกลิงก์ได้')
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="lg"
      className="w-full gap-2"
    >
      <Share2 className="size-4" />
      แชร์รายวิชาที่เลือก
    </Button>
  )
}
