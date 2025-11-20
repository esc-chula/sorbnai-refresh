import { useSearch } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useLocalStorage } from './use-local-storage'
import { getRouter } from '@/router'

export function useSyncExams() {
  const { exams } = useSearch({
    strict: false,
  })

  const [storedExams] = useLocalStorage<Array<string>>('selected-exams', [], {
    initializeWithValue: false,
  })

  useEffect(() => {
    if (exams === undefined || exams.length === 0) {
      getRouter().navigate({
        to: '.',
        search: (old) => ({
          ...old,
          exams: storedExams,
        }),
      })
    }
  }, [exams, storedExams])
}
