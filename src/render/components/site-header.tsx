import { ModeToggle } from '@render/components/mode-toggle'

export function SiteHeader() {
  return (
    <header className="bg-background w-full border-b">
      <div className="container pl-4 pr-4 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
