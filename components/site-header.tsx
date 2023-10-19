import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-5 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav />
        <ThemeToggle />
      </div>
    </header>
  )
}
