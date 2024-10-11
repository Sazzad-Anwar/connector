import configs from '@/../package.json'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '../theme-toggler'

export function SideNavHeader() {
  return (
    <div className="flex items-center justify-between gap-6 border-b px-3 py-[11px] md:gap-10">
      <Link
        to="/"
        className="flex items-center space-x-2"
      >
        <i className="bi bi-plugin text-2xl" />
        <span className="inline-block font-bold text-xl">Connector</span>
        <sup className="text-[9px]">{configs.version}</sup>
      </Link>
      <ThemeToggle />
    </div>
  )
}
