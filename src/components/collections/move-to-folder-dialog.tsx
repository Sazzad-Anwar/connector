import { Dispatch, lazy, SetStateAction, Suspense } from 'react'
import { findRootCollection } from '../../lib/utils'
import useApiStore from '../../store/store'
import { ApiType } from '../../types/api'
import Loading from '../loading'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
const MoveToFolder = lazy(() => import('./move-to-folder'))

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
      <AlertDialogContent className="min-w-[800px] w-auto h-auto">
        <AlertDialogHeader className="block">
          <AlertDialogTitle>Move APIs To Folder</AlertDialogTitle>
          <AlertDialogDescription>
            You've selected{' '}
            <b className="text-primary">
              {apis
                ?.slice(0, 3)
                .map((api) => api.name)
                .join(', ')}
              {apis?.length > 3 && ` +${apis.length - 3} more`}
            </b>{' '}
            api{apis?.length > 1 && 's'} to move.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Suspense fallback={<Loading />}>
          <MoveToFolder
            apis={apis}
            folders={collection?.children ?? []}
            folderId={folderId}
            setIsDialogOpen={setIsDialogOpen}
            setSelectedApis={setSelectedApis}
          />
        </Suspense>
      </AlertDialogContent>
    </AlertDialog>
  )
}
