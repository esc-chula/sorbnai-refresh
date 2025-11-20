import { Button } from './ui/button'
import { Share2, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

interface ShareScheduleButtonProps {
  selectedClasses: string[]
}

type FeedbackState = 'idle' | 'success' | 'error'

export function ShareScheduleButton({
  selectedClasses,
}: ShareScheduleButtonProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const showFeedback = (state: FeedbackState) => {
    setFeedback(state)
    setTimeout(() => setFeedback('idle'), 2000)
  }

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
        showFeedback('success')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          showFeedback('error')
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url.toString())
        showFeedback('success')
      } catch (error) {
        showFeedback('error')
      }
    }
  }

  return (
    <motion.div
      className="relative w-full"
      animate={
        feedback === 'success'
          ? { scale: [1, 1.05, 1] }
          : feedback === 'error'
            ? { x: [0, -10, 10, -10, 10, 0] }
            : {}
      }
      transition={{ duration: 0.4 }}
    >
      <Button
        onClick={handleShare}
        variant="outline"
        size="lg"
        className="w-full gap-2"
      >
        <AnimatePresence mode="wait">
          {feedback === 'success' ? (
            <motion.div
              key="success"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Check className="size-4 text-green-600" />
            </motion.div>
          ) : feedback === 'error' ? (
            <motion.div
              key="error"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <X className="size-4 text-red-600" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Share2 className="size-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <span>
          {feedback === 'success'
            ? 'คัดลอกแล้ว'
            : feedback === 'error'
              ? 'ลองใหม่อีกครั้ง'
              : 'แชร์รายวิชาที่เลือก'}
        </span>
      </Button>
    </motion.div>
  )
}
