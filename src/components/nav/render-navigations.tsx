/* eslint-disable @typescript-eslint/no-explicit-any */
import useApiStore from '@/store/store'
import { ChevronRight, FolderClosed, MoreVertical } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'
import { v4 as uuid } from 'uuid'
import * as z from 'zod'

import useImportJSON from '@/hooks/useImportJSON'
import { cn } from '@/lib/utils'
import { ApiType, FolderType } from '@/types/api'

import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs'
import { platform } from '@tauri-apps/api/os'
import { useNavigate, useParams } from 'react-router-dom'
import AddCollectionDialog from '../collections/add-collection-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { buttonVariants } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { toast } from '../ui/use-toast'
import { CollectionSchema } from './nav'

interface RenderNavigationProps {
  collection: FolderType
}

export default function RenderNavigation({
  collection,
}: RenderNavigationProps): JSX.Element {
  const navigate = useNavigate()
  const params = useParams()
  const { InputFile } = useImportJSON()
  const [apiDetails, setApiDetails] = useState<ApiType>()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navWidthRef = useRef<HTMLDivElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const addFolderButtonRef = useRef<HTMLButtonElement>(null)
  const { updateFolder, deleteFolder, createFolder, deleteApi } = useApiStore()

  // Rename collection
  const renameCollectionName: SubmitHandler<
    z.infer<typeof CollectionSchema>
  > = (data) => {
    const updateData = { ...collection, name: data.collectionName }
    updateFolder(updateData, collection.id)

    toast({
      variant: 'success',
      title: 'Folder is created',
    })
  }

  // Delete Collection
  const deleteCollection = (id: string) => {
    deleteFolder(id)
    toast({
      variant: 'success',
      title: `${collection.type} is deleted`,
    })
    navigate('/')
  }

  // Add folder
  const addFolder: SubmitHandler<z.infer<typeof CollectionSchema>> = (data) => {
    const folder: FolderType = {
      name: data.collectionName,
      id: uuid(),
      isOpen: true,
      type: 'folder',
    }
    createFolder(folder, collection.id)
    if (params.collectionId === collection.id) {
      navigate('/')
    }
  }

  // Delete Collection
  const deleteApiHandler = (id: string) => {
    deleteApi(id)
    toast({
      variant: 'success',
      title: `Api is deleted`,
    })
    if (params.apiId === id) {
      navigate('/')
    }
  }
  // Export as JSON
  const downloadFile = async ({
    data,
    fileName,
    fileType,
  }: {
    data: FolderType
    fileName: string
    fileType: string
  }) => {
    const downloadFromBrowser = () => {
      // Create a blob with the data we want to download as a file
      const blob = new Blob([JSON.stringify(data)], { type: fileType })
      // Create an anchor element and dispatch a click event on it
      // to trigger a download
      const a = document.createElement('a')
      a.download = fileName
      a.href = window.URL.createObjectURL(blob)
      const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      })
      a.dispatchEvent(clickEvt)
      a.remove()
    }

    try {
      const platformName = await platform()
      if (
        platformName === 'darwin' ||
        platformName === 'linux' ||
        platformName === 'win32'
      ) {
        await writeTextFile(`${fileName}.json`, JSON.stringify(data), {
          dir: BaseDirectory.Download,
        })
        toast({
          variant: 'success',
          title: `${fileName} is saved to Downloads`,
        })
      }
    } catch (error: any) {
      downloadFromBrowser()
      toast({
        variant: 'success',
        title: `${fileName} is saved to Downloads`,
      })
    }
  }

  const folderDropDownMenu: {
    name: React.ReactNode | string
    onClick: (e: any) => void
    isHidden?: boolean
  }[] = [
    {
      name: 'Env Variables',
      onClick: (e) => {
        e.stopPropagation()
        navigate(`/api/variables/${collection.id}`)
      },
      isHidden: collection.type === 'folder',
    },
    {
      name: 'Add Request',
      onClick: (e) => {
        e?.stopPropagation()
        navigate(`/api/${collection.id}/add`)
      },
    },
    {
      name: 'Add Folder',
      onClick: (e) => {
        e?.stopPropagation()
        addFolderButtonRef.current?.click()
      },
    },
    {
      name: 'Rename',
      onClick: (e) => {
        e?.stopPropagation()
        buttonRef.current?.click()
      },
    },

    {
      name: 'Export',
      onClick: (e) => {
        e?.stopPropagation()
      },
    },
    {
      name: (
        <InputFile
          collectionId={collection.id !== 'undefined' ? collection.id : ''}
          className="w-full h-5 text-secondary-foreground justify-start border-0 bg-transparent py-0 pl-0 text-left hover:bg-secondary"
        >
          Import
        </InputFile>
      ),
      onClick: (e) => {
        e?.stopPropagation()
      },
    },
    {
      name: 'Delete',
      onClick: (e) => {
        e?.stopPropagation()
        deleteButtonRef.current?.click()
      },
    },
  ]

  return (
    <>
      <div
        ref={navWidthRef}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'xs' }),
          'group relative w-full cursor-pointer items-center justify-between rounded-none',
        )}
        onClick={() => {
          updateFolder(
            { ...collection, isOpen: !collection.isOpen },
            collection.id,
          )
        }}
      >
        <div className="flex h-7 items-center">
          <ChevronRight
            size={15}
            className={
              (collection.isOpen ? 'rotate-90' : '') +
              ' transition-all duration-100 ease-linear mr-3'
            }
          />
          <FolderClosed
            size={14}
            className="mr-2"
          />
          {collection.name}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MoreVertical
              className="opacity-20 group-hover:opacity-100"
              size={18}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {folderDropDownMenu.map((item) => {
              if (!item.isHidden) {
                return (
                  <DropdownMenuItem
                    key={uuid()}
                    onClick={(e) => {
                      item.onClick(e)
                      if (item.name === 'Export') {
                        downloadFile({
                          data: collection,
                          fileName: collection.name + '.json',
                          fileType: 'text/json',
                        })
                      }
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

      {collection.isOpen && (
        <div className="animate__animated animate__fadeIn child ml-6 border-l">
          {collection?.children?.map((folder) => (
            <RenderNavigation
              collection={folder}
              key={folder.id}
            />
          ))}
          {collection.apis?.map((api) => (
            <div
              key={api.id}
              onClick={() => navigate(`/api/${collection.id}/${api.id}`)}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'xs' }),
                'group relative w-full cursor-pointer items-center justify-between rounded-none truncate',
                params.apiId && params.apiId === api.id
                  ? 'border-l-2 border-primary bg-secondary'
                  : '',
              )}
            >
              <div className="flex items-center">
                <span
                  className={
                    (api.method === 'GET'
                      ? 'text-green-500'
                      : api.method === 'POST'
                      ? 'text-yellow-500'
                      : api.method === 'PUT'
                      ? 'text-blue-500'
                      : api.method === 'PATCH'
                      ? 'text-purple-500'
                      : 'text-destructive') + ' font-bold mr-2 text-xs'
                  }
                >
                  {api.method}
                </span>
                <span
                  style={{
                    width:
                      navWidthRef?.current?.clientWidth &&
                      navWidthRef.current?.clientWidth - 130,
                  }}
                  className="truncate"
                >
                  {api.name}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MoreVertical
                    className="opacity-0 group-hover:opacity-100"
                    size={18}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      setApiDetails(api)
                      e.stopPropagation()
                      navigate(`/api/${collection.id}/${api.id}/update`)
                    }}
                  >
                    Update
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      setApiDetails(api)
                      e.stopPropagation()
                      deleteButtonRef.current?.click()
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* ---------- All dialogs --------- */}

      {/* Update folder Dialog */}
      <div className="hidden">
        <AddCollectionDialog
          name={collection.name}
          type={collection.type}
          onSubmit={renameCollectionName}
        >
          <button ref={buttonRef}>click</button>
        </AddCollectionDialog>
      </div>

      {/* Add folder Dialog */}
      <div className="hidden">
        <AddCollectionDialog
          type="folder"
          onSubmit={addFolder}
        >
          <button ref={addFolderButtonRef}>click</button>
        </AddCollectionDialog>
      </div>

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger
          className="hidden"
          ref={deleteButtonRef}
        >
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <h1 className="text-xl">
            Are you sure you want to delete this item?
          </h1>
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel
              type="button"
              className={buttonVariants({
                size: 'xs',
                variant: 'outline',
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
    </>
  )
}
