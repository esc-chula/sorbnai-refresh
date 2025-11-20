import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { env } from '@/env'

export const Route = createFileRoute('/api/thai-exam-rooms')({
  server: {
    handlers: {
      GET: async () => {
        const thaiExamRooms = await fetch(env.FILE_PATH)
        const data = await thaiExamRooms.json()
        return json(data)
      },
    },
  },
})
