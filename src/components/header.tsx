import { Link } from '@tanstack/react-router'

export function Header() {
  return (
    <header className="bg-card sticky top-0 z-50 flex w-full px-4 py-5 shadow-md">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="shrink-0" />
        </Link>
      </div>
    </header>
  )
}
