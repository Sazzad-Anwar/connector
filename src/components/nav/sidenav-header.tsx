import configs from '@/../package.json'
import { platform } from '@tauri-apps/plugin-os'
import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useUpdate from '../../hooks/useUpdate'
import { ThemeToggle } from '../theme-toggler'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

export function SideNavHeader() {
  const { RestartApp, checkUpdate, updateDetails } = useUpdate()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = async () => {
      try {
        const os = platform()
        if (['windows', 'macos', 'linux'].includes(os)) {
          setIsDesktop(true)
        }
      } catch (error) {
        setIsDesktop(false)
      }
    }

    checkDesktop()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between gap-6 border-b px-3 py-[11px] md:gap-10">
        <Link
          to="/"
          className="flex items-center space-x-2"
        >
          <i className="bi bi-plugin text-2xl" />
          <span className="inline-block font-bold text-xl">Connector</span>
          <sup className="text-[9px]">{configs.version}</sup>
        </Link>

        <div className="space-x-2">
          {isDesktop && (
            <Dialog>
              <DialogTrigger>
                <Settings size={20} />
              </DialogTrigger>
              <DialogContent className="h-72 block">
                <DialogHeader>
                  <DialogTitle>Connector</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    A cross platform lightweight application for building and
                    using API
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col mt-10 items-center justify-center">
                  <h1 className="text-2xl text-muted-foreground">
                    v{updateDetails?.currentVersion}
                  </h1>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-5"
                    onClick={() => checkUpdate()}
                  >
                    Check for Update
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <ThemeToggle />
        </div>
      </div>
      <RestartApp />
    </>
  )
}
