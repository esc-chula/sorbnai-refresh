import { cn } from '@/lib/utils'
import { Button } from './ui/button'

export function ThaiClasses({
  classes,
  selectedClasses,
  setSelectedClasses,
}: {
  classes: { code: string; title: string }[]
  selectedClasses: string[]
  setSelectedClasses: (classes: string[]) => void
}) {
  const handleToggleSelectClass = (code: string) => {
    if (selectedClasses.includes(code)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== code))
    } else {
      setSelectedClasses([...selectedClasses, code])
    }
  }

  return (
    <div className="flex h-[40dvh] w-full flex-col gap-2.5 overflow-y-auto">
      {classes.map(({ code, title }) => (
        <Button
          key={code + title.replaceAll(/\s/g, '-').toLowerCase()}
          variant="outline"
          onClick={() => handleToggleSelectClass(code)}
          className={cn(
            'flex h-max w-full items-start justify-start gap-1 px-6 py-2.5 shadow-sm transition-colors duration-150 hover:underline',
            selectedClasses.includes(code)
              ? 'bg-esc-carmine-400 text-esc-carmine-50 border-esc-carmine-600 hover:bg-esc-carmine-400 hover:text-esc-carmine-50'
              : 'bg-card text-esc-carmine-400 border-esc-carmine-200 hover:bg-card hover:text-esc-carmine-400'
          )}
        >
          <span>{code}</span>
          <span className="w-full truncate">{title}</span>
        </Button>
      ))}
    </div>
  )
}
