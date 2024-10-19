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

import React, { Fragment, useRef } from 'react'
import { v4 as uuid } from 'uuid'

import { cn, findRootCollection } from '@/lib/utils'
import { FolderType } from '@/types/api'

import { useParams } from 'react-router-dom'
import useRenderNav from '../../hooks/useRenderNav'
import useApiStore from '../../store/store'
import { default as CreateFolder } from '../collections/create-folder'
import MoveToFolderDialog from '../collections/move-to-folder-dialog'
import EnvVariables from '../env/env-variables'
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
  const { collections } = useApiStore()
  const navWidthRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const {
    isFolderOpen,
    setIsFolderOpen,
    isEnvDialogOpen,
    setIsEnvDialogOpen,
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
    isCreatingFolder,
    isFolderNameUpdating,
    isMoveToFolderDialogOpen,
    setIsMoveToFolderDialogOpen,
    handleClickApi,
    setSelectedApis,
    downloadFile,
  } = useRenderNav({ collection })

  return (
    <div className="scroll-smooth">
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
                <div className="size-[18px] mr-3">
                  <ChevronRight
                    size={18}
                    className={
                      (isFolderOpen ? 'rotate-90' : '') +
                      ' transition-all duration-100 ease-linear'
                    }
                  />
                </div>

                <CreateFolder
                  name={collection.name}
                  onSubmit={renameCollectionName}
                  type="folder"
                  className="w-full flex text-[13px] items-center"
                  actionType={'update'}
                />
              </>
            ) : (
              <button
                onClick={() => {
                  setIsFolderOpen(!isFolderOpen)
                }}
                className="flex flex-1 h-7 text-[13px] items-center focus-within:outline-none focus-visible:outline-none"
              >
                <div className="size-[18px] mr-3">
                  <ChevronRight
                    size={18}
                    className={
                      (isFolderOpen ? 'rotate-90' : '') +
                      ' transition-all duration-100 ease-linear'
                    }
                  />
                </div>
                <div className="mr-2 size-[18px]">
                  <FolderClosed size={18} />
                </div>

                <span className="w-full text-left mt-2 block px-1 text-[13px] h-7">
                  {collection.name}
                </span>
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
              <Fragment key={`folder-${collection.id}-api-${api.id}`}>
                <ContextMenu key={`folder-${collection.id}-api-${api.id}`}>
                  <ContextMenuTrigger asChild>
                    <div
                      id={api.id}
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
                        'group relative w-full cursor-pointer items-center justify-between rounded-none truncate scroll-mt-20',
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
                            'font-medium text-white mr-2 text-[10px] px-1 py-0.5 rounded-md',
                          )}
                        >
                          {api.method}
                        </span>
                        <span className="truncate text-[13px]">{api.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <MoreVertical
                            className="opacity-0 group-hover:opacity-100"
                            size={18}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApis([...selectedApis, api])
                              setIsMoveToFolderDialogOpen(true)
                            }}
                          >
                            Move
                          </DropdownMenuItem>
                          {!selectedApis.map((a) => a.id).includes(api.id) && (
                            <DropdownMenuItem
                              onClick={() => {
                                downloadFile({
                                  data: api,
                                  fileName: api.name + '.json',
                                  fileType: 'text/json',
                                })
                              }}
                            >
                              Export
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              setApiDetails(api)
                              e.stopPropagation()
                              deleteButtonRef.current?.click()
                            }}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
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
                    {!selectedApis.map((a) => a.id).includes(api.id) && (
                      <ContextMenuItem
                        onClick={() => {
                          downloadFile({
                            data: api,
                            fileName: api.name + '.json',
                            fileType: 'text/json',
                          })
                        }}
                      >
                        Export
                      </ContextMenuItem>
                    )}

                    <ContextMenuItem
                      onClick={(e) => {
                        setApiDetails(api)
                        e.stopPropagation()
                        deleteButtonRef.current?.click()
                      }}
                      className="text-red-500"
                    >
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </Fragment>
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
                className: 'h-8',
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
                className: 'h-8',
              })}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Env Dialog */}
      <AlertDialog
        open={isEnvDialogOpen}
        onOpenChange={setIsEnvDialogOpen}
      >
        <AlertDialogContent className="min-w-[80%] w-auto h-auto block">
          <AlertDialogHeader className="h-auto">
            <AlertDialogTitle>Env Variables</AlertDialogTitle>
            <AlertDialogDescription>
              You can add, edit or delete env variables here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <EnvVariables
            collectionId={collection?.id}
            setIsEnvDialogOpen={setIsEnvDialogOpen}
          />
          <AlertDialogFooter />
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
    </div>
  )
}
