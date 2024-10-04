import { Dispatch, SetStateAction } from 'react'
import { findRootCollection } from '../../lib/utils'
import useApiStore from '../../store/store'
import { ApiType } from '../../types/api'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import MoveToFolder from './move-to-folder'

type Props = {
  apis: ApiType[]
  isDialogOpen: boolean
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
  setSelectedApis: Dispatch<SetStateAction<ApiType[]>>
  folderId: string
}

export default function MoveToFolderDialog({
  apis,
  isDialogOpen,
  setIsDialogOpen,
  folderId,
  setSelectedApis,
}: Props) {
  const { collections } = useApiStore()
  const collection = findRootCollection(collections, folderId)
  return (
    <AlertDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move APIs To Folder</AlertDialogTitle>
          <AlertDialogDescription>
            You've selected{' '}
            <b className="text-primary">
              {apis?.map((api) => api.name).join(', ')}
            </b>{' '}
            apis to move.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <MoveToFolder
          apis={apis}
          folders={collection?.children ?? []}
          folderId={folderId}
          setIsDialogOpen={setIsDialogOpen}
          setSelectedApis={setSelectedApis}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}
