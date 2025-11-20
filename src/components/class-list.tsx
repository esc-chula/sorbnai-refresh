import { Button } from './ui/button'
import { cn } from '@/lib/utils'

export function ClassList({
  classes,
  selected,
  setSelected,
}: {
  classes: Array<{ code: string; title: string }>
  selected: Array<string>
  setSelected: (classes: Array<string>) => void
}) {
  const toggleExam = (code: string) => {
    if (selected.includes(code)) {
      setSelected(selected.filter((c) => c !== code))
    } else {
      setSelected([...selected, code])
    }
  }

  return (
    <div className="flex h-[40dvh] w-full flex-col gap-2.5 overflow-y-auto">
      {classes.map(({ code, title }) => (
        <Button
          key={code + title.replaceAll(/\s/g, '-').toLowerCase()}
          variant="outline"
          onClick={() => toggleExam(code)}
          className={cn(
            'flex h-max w-full items-start justify-start gap-1 px-6 py-2.5 shadow-sm transition-colors duration-150 hover:underline',
            selected.includes(code)
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
