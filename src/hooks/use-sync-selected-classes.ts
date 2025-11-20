import { getRouter } from '@/router'
import { useSearch } from '@tanstack/react-router'
import { useLocalStorage } from './use-local-storage'
import { useEffect } from 'react'

export function useSyncSelectedClasses() {
  const { selectedClasses } = useSearch({
    strict: false,
  })

  const [selectedClassesLocal] = useLocalStorage<string[]>(
    'selected-classes',
    [],
    { initializeWithValue: false }
  )

  useEffect(() => {
    if (selectedClasses === undefined || selectedClasses.length === 0) {
      getRouter().navigate({
        to: '.',
        search: (old) => ({
          ...old,
          selectedClasses: selectedClassesLocal,
        }),
      })
    }
  }, [selectedClasses, selectedClassesLocal])
}
