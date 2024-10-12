import { relaunch } from '@tauri-apps/plugin-process'
import { check, Update } from '@tauri-apps/plugin-updater'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { toast } from '../components/ui/use-toast'

export default function useUpdate() {
  const [updateDetails, setUpdateDetails] = useState<Update>({} as Update)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const checkUpdate = async () => {
    try {
      const update = await check()
      if (update?.available) {
        setUpdateDetails(update)
        toast({
          variant: 'default',
          title: 'Update available',
          description: `Found update ${update.version} from ${update.date} with notes ${update.body}`,
        })
      }
      toast({
        variant: 'default',
        title: 'Checking for updates',
        description: JSON.stringify(update),
      })
      let downloaded = 0
      let contentLength = 0
      // alternatively we could also call update.download() and update.install() separately
      if (update?.available) {
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength!
              toast({
                variant: 'default',
                title: 'Started Downloading',
                description: `Started downloading ${event.data.contentLength} bytes`,
              })
              break
            case 'Progress':
              downloaded += event.data.chunkLength
              toast({
                variant: 'default',
                title: 'Downloading',
                description: `Downloaded ${downloaded} from ${contentLength}`,
              })
              break
            case 'Finished':
              toast({
                variant: 'default',
                title: 'Downloaded',
                description: `Downloaded finished`,
              })
              break
          }
        })
        setIsAlertDialogOpen(true)
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(error)
      }
      toast({
        variant: 'default',
        title: 'Error checking for updates',
        description: JSON.stringify(error),
      })
    }
  }

  const RestartApp = () => {
    return (
      <AlertDialog
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you want to restart your app now?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Connector has been updated to {updateDetails.version}. Please
              restart your app to load the new version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => await relaunch()}>
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return {
    checkUpdate,
    updateDetails,
    RestartApp,
  }
}
