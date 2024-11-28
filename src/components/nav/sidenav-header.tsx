import configs from "@/../package.json";
// import { Settings } from 'lucide-react'
import { Link } from "react-router-dom";
// import useUpdate from '../../hooks/useUpdate'
import { ThemeToggle } from "../theme-toggler";
// import { Button } from '../ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '../ui/dialog'

export function SideNavHeader() {
  // const { RestartApp, checkUpdate, updateDetails } = useUpdate()
  // const [isDesktop, setIsDesktop] = useState(false)

  // useEffect(() => {
  //   const checkDesktop = async () => {
  //     try {
  //       const os = platform()
  //       if (['windows', 'macos', 'linux'].includes(os)) {
  //         setIsDesktop(true)
  //       }
  //     } catch (error) {
  //       setIsDesktop(false)
  //     }
  //   }

  //   checkDesktop()
  // }, [])

  return (
    <>
      <div className="flex gap-6 justify-between items-center px-3 border-b md:gap-10 no-select py-[11px]">
        <Link to="/" className="flex items-center space-x-2">
          <i className="text-2xl bi bi-plugin" />
          <span className="inline-block text-xl font-bold">Connector</span>
          <sup className="text-[9px]">{configs.version}</sup>
        </Link>

        <div className="space-x-2">
          {/* {isDesktop && (
            <Dialog>
              <DialogTrigger>
                <Settings size={20} />
              </DialogTrigger>
              <DialogContent className="block h-72">
                <DialogHeader>
                  <DialogTitle>Connector</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    A cross platform lightweight application for building and
                    using API
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center items-center mt-10">
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
          )} */}
          <ThemeToggle />
        </div>
      </div>
      {/* <RestartApp /> */}
    </>
  );
}
