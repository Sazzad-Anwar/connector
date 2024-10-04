import { Check, ChevronLeft, Folder } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'
import { cn, findRootCollection, moveApisToFolder } from '../../lib/utils'
import useApiStore from '../../store/store'
import { ApiType, FolderType } from '../../types/api'
import { AlertDialogCancel, AlertDialogFooter } from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { toast } from '../ui/use-toast'

type Props = {
  apis: ApiType[]
  folders: FolderType[]
  folderId: string
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
  setSelectedApis: Dispatch<SetStateAction<ApiType[]>>
}

export default function MoveToFolder({
  apis,
  folders,
  folderId,
  setIsDialogOpen,
  setSelectedApis,
}: Props) {
  const [nestedFolders, setNestedFolders] = useState<FolderType[]>(folders)
  const [parentId, setParentId] = useState<string>('')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const { collections, updateCollection } = useApiStore()

  const collection = findRootCollection(collections, folderId)

  const handleGoBack = () => {
    console.log(parentId)
    setNestedFolders(folders)
    setParentId('')
  }

  const handleApiMove = () => {
    console.log({
      collection,
      selectedFolder,
      apis: apis?.map((api) => api.id),
      folderId,
    })
    const updatedCollection = moveApisToFolder(
      collection!,
      selectedFolder,
      apis?.map((api) => api.id),
    )
    if (!updatedCollection) {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to move APIs to selected folder',
      })
    } else {
      updateCollection(updatedCollection, collection?.id!)
      toast({
        variant: 'success',
        title: 'Success',
        description: 'APIs moved to selected folder',
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <>
      <div className="w-full h-full flex gap-2 flex-wrap">
        {nestedFolders?.map((item) => (
          <button
            key={item?.id}
            className={cn(
              'flex flex-col items-center gap-2 hover:bg-secondary p-3 w-36 rounded-lg relative',
              item?.id === selectedFolder ? 'bg-secondary' : '',
            )}
            onClick={() => {
              setSelectedFolder(item?.id)
            }}
            onDoubleClick={() => {
              if (item?.children?.length) {
                setNestedFolders(item?.children)
                setParentId(item?.id)
                setSelectedFolder('')
              }
            }}
          >
            {item?.id === selectedFolder && (
              <span className="size-5 rounded-full bg-green-700 absolute top-1 right-1 flex justify-center items-center">
                <Check size={16} />
              </span>
            )}

            <Folder size={30} />
            <span className="text-xs truncate">{item?.name}</span>
          </button>
        ))}
      </div>
      <AlertDialogFooter
        className={cn('flex w-full', parentId && 'sm:justify-between')}
      >
        {parentId && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleGoBack}
            className="h-8 pl-2"
          >
            <ChevronLeft
              size={16}
              className="mr-2 ml-0 pl-0"
            />
            Back
          </Button>
        )}
        <div className="flex items-center gap-2">
          <AlertDialogCancel
            className="h-8"
            onClick={() => setSelectedApis([])}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            className="h-8"
            type="button"
            onClick={handleApiMove}
          >
            Move
          </Button>
        </div>
      </AlertDialogFooter>
    </>
  )
}
