import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  ChevronRight,
  FileDown,
  FolderClosed,
  MoreVertical,
} from 'lucide-react'

import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { cn, findRootCollection } from '@/lib/utils'
import { FolderType } from '@/types/api'

import { useNavigate, useParams } from 'react-router-dom'
import useRenderNav from '../../hooks/useRenderNav'
import useApiStore from '../../store/store'
import { default as CreateFolder } from '../collections/create-folder'
import MoveToFolderDialog from '../collections/move-to-folder-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { buttonVariants } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

interface RenderNavigationProps {
  collection: FolderType
}

export default function RenderNavigation({
  collection,
}: RenderNavigationProps): JSX.Element {
  const navigate = useNavigate()
  const { collections } = useApiStore()
  const [isFolderOpen, setIsFolderOpen] = useState(true)
  const navWidthRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const {
    renameCollectionName,
    deleteCollection,
    addFolder,
    InputFile,
    apiDetails,
    setApiDetails,
    deleteButtonRef,
    folderDropDownMenu,
    deleteApiHandler,
    selectedApis,
    collectionId,
    setCollectionId,
    isCreatingFolder,
    setIsCreatingFolder,
    isFolderNameUpdating,
    setIsFolderNameUpdating,
    isMoveToFolderDialogOpen,
    setIsMoveToFolderDialogOpen,
    handleClickApi,
    setSelectedApis,
  } = useRenderNav({ collection })

  useEffect(() => {
    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        setIsFolderNameUpdating(false)
        setCollectionId('')
        setIsCreatingFolder(false)
        setSelectedApis([])
      }
    }

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleEscapeKeyPress)
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={navWidthRef}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'xs' }),
              'group sticky top-0 w-full bg-background z-10 cursor-pointer items-center justify-between rounded-none',
            )}
          >
            {isFolderNameUpdating && collection.id === collectionId ? (
              <>
                <ChevronRight
                  size={20}
                  className={
                    (isFolderOpen ? 'rotate-90' : '') +
                    ' transition-all duration-100 ease-linear mr-3'
                  }
                />
                <CreateFolder
                  name={collection.name}
                  onSubmit={renameCollectionName}
                  type="folder"
                  className="w-full flex items-center"
                  actionType={'update'}
                />
              </>
            ) : (
              <button
                onClick={() => {
                  setIsFolderOpen(!isFolderOpen)
                }}
                className="flex flex-1 h-7 items-center"
              >
                <ChevronRight
                  size={15}
                  className={
                    (isFolderOpen ? 'rotate-90' : '') +
                    ' transition-all duration-100 ease-linear mr-3'
                  }
                />
                <FolderClosed
                  size={14}
                  className="mr-2"
                />
                {collection.name}
              </button>
            )}
            <div className="flex items-center">
              <InputFile
                id={uuid()}
                importOn="collection"
                variant="link"
                size="xs"
                className="p-1 opacity-20 group-hover:opacity-100"
                collectionId={collection.id}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileDown size={16} />
                  </TooltipTrigger>
                  <TooltipContent>
                    Import in {collection.name} collection
                  </TooltipContent>
                </Tooltip>
              </InputFile>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MoreVertical
                    className="opacity-20 group-hover:opacity-100"
                    size={18}
                    startOffset={30}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {folderDropDownMenu.map((item) => {
                    if (!item.isHidden) {
                      return (
                        <DropdownMenuItem
                          key={uuid()}
                          onClick={(e) => {
                            item.onClick(e)
                          }}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      )
                    } else {
                      return null
                    }
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {folderDropDownMenu.map((item) => {
            if (!item.isHidden) {
              return (
                <ContextMenuItem
                  key={uuid()}
                  onClick={(e) => {
                    item.onClick(e)
                  }}
                >
                  {item.name}
                </ContextMenuItem>
              )
            } else {
              return null
            }
          })}
        </ContextMenuContent>
      </ContextMenu>

      {isFolderOpen && (
        <div className="animate__animated animate__fadeIn child ml-6 border-l">
          {collection?.children
            ?.sort((a, b) => a.name?.localeCompare(b.name))
            .map((folder) => (
              <RenderNavigation
                collection={folder}
                key={`folder-${folder.id}`}
              />
            ))}
          {isCreatingFolder && collection.id === collectionId && (
            <CreateFolder
              name={collection.name}
              onSubmit={addFolder}
              type="folder"
              actionType={'create'}
            />
          )}

          {collection.apis
            ?.sort((a, b) => a.name?.localeCompare(b.name))
            .map((api) => (
              <ContextMenu key={`api-${api.id}`}>
                <ContextMenuTrigger asChild>
                  <div
                    onClick={(event) =>
                      handleClickApi(
                        event as unknown as React.MouseEvent<
                          HTMLButtonElement,
                          MouseEvent
                        >,
                        api,
                      )
                    }
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'xs' }),
                      'group relative w-full cursor-pointer items-center justify-between rounded-none truncate',
                      (params.apiId && params.apiId === api.id) ||
                        selectedApis
                          .map((apiType) => apiType.id)
                          .includes(api.id)
                        ? 'border-l-2 border-primary bg-secondary'
                        : 'border-l-2 border-transparent',
                    )}
                  >
                    <div className="w-full truncate">
                      <span
                        className={cn(
                          api.method === 'GET'
                            ? ' bg-green-700 border border-green-500'
                            : api.method === 'POST'
                            ? 'bg-yellow-700 border-yellow-500'
                            : api.method === 'PUT'
                            ? 'bg-cyan-700 border-cyan-500'
                            : api.method === 'PATCH'
                            ? 'bg-purple-700 border-purple-500'
                            : 'bg-red-700 border-red-500',
                          'font-medium text-white mr-2 text-xs px-1 py-0.5 rounded-md',
                        )}
                      >
                        {api.method}
                      </span>
                      <span className="truncate text-sm">{api.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <MoreVertical
                          className="opacity-0 group-hover:opacity-100"
                          size={18}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!selectedApis
                          .map((apiType) => apiType.id)
                          .includes(api.id) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              setApiDetails(api)
                              e.stopPropagation()
                              navigate(`/api/${collection.id}/${api.id}/update`)
                            }}
                          >
                            Update
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          onClick={(e) => {
                            setApiDetails(api)
                            e.stopPropagation()
                            deleteButtonRef.current?.click()
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedApis([...selectedApis, api])
                            setIsMoveToFolderDialogOpen(true)
                          }}
                        >
                          Move
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {selectedApis.length > 1 &&
                    selectedApis.map((item) => item.id).includes(api.id) && (
                      <ContextMenuItem
                        onClick={(e) => {
                          setApiDetails(api)
                          e.stopPropagation()
                          navigate(`/api/${collection.id}/${api.id}/update`)
                        }}
                      >
                        Update
                      </ContextMenuItem>
                    )}
                  <ContextMenuItem
                    onClick={(e) => {
                      setApiDetails(api)
                      e.stopPropagation()
                      deleteButtonRef.current?.click()
                    }}
                  >
                    Delete
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => {
                      setIsMoveToFolderDialogOpen(true)
                      if (!selectedApis.map((a) => a.id).includes(api.id)) {
                        setSelectedApis([...selectedApis, api])
                      }
                    }}
                  >
                    Move
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
        </div>
      )}

      {/* ---------- All dialogs --------- */}

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger
          className="hidden"
          ref={deleteButtonRef}
        >
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              item and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel
              type="button"
              className={buttonVariants({
                size: 'xs',
                variant: 'outline',
                className: '',
              })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                apiDetails?.name
                  ? deleteApiHandler(apiDetails.id)
                  : deleteCollection(collection.id)
              }
              className={buttonVariants({
                variant: 'destructive',
                size: 'xs',
              })}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <MoveToFolderDialog
        apis={selectedApis}
        isDialogOpen={isMoveToFolderDialogOpen}
        setIsDialogOpen={setIsMoveToFolderDialogOpen}
        folderId={
          collection.type === 'folder'
            ? collection.id
            : findRootCollection(collections, collection.id)?.id || ''
        }
        setSelectedApis={setSelectedApis}
      />
    </>
  )
}
