import { Dispatch, SetStateAction } from 'react'
import useApiStore from '../../store/store'
import { ApiType } from '../../types/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

type Props = {
  apis: ApiType[]
  isDialogOpen: boolean
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
  setApis: Dispatch<SetStateAction<ApiType[]>>
  collectionId: string
}

export default function MoveToFolderDialog({
  apis,
  isDialogOpen,
  setIsDialogOpen,
  collectionId,
}: Props) {
  const { collections } = useApiStore()

  return (
    <AlertDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
