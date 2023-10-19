"use client"

import React, { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useApiStore from "@/store/store"
import { ChevronRight, FolderClosed, MoreVertical, Upload } from "lucide-react"
import QueryString from "qs"
import { SubmitHandler } from "react-hook-form"
import { v4 as uuid } from "uuid"
import * as z from "zod"

import { ApiType, FolderType } from "@/types/api"
import { cn, isEmpty } from "@/lib/utils"
import useImportJSON from "@/hooks/useImportJSON"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { buttonVariants } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { toast } from "../ui/use-toast"
import AddApiDialog from "./add-api-dialog"
import AddCollectionDialog from "./add-collection-dialog"
import { CollectionSchema } from "./page"

interface RenderNavigationProps {
  collection: FolderType
}

export default function RenderNavigation({
  collection,
}: RenderNavigationProps): JSX.Element {
  let router = useRouter()
  let params = useParams()
  let { InputFile } = useImportJSON()
  let [apiDetails, setApiDetails] = useState<ApiType>()
  let buttonRef = useRef<HTMLButtonElement>(null)
  let deleteButtonRef = useRef<HTMLButtonElement>(null)
  let addFolderButtonRef = useRef<HTMLButtonElement>(null)
  let addApiButtonRef = useRef<HTMLButtonElement>(null)
  let updateApiButtonRef = useRef<HTMLButtonElement>(null)
  let {
    updateFolder,
    deleteFolder,
    createFolder,
    createApi,
    updateApi,
    deleteApi,
  } = useApiStore()

  // Rename collection
  const renameCollectionName: SubmitHandler<
    z.infer<typeof CollectionSchema>
  > = (data) => {
    let updateData = { ...collection, name: data.collectionName }
    updateFolder(updateData, collection.id)

    toast({
      variant: "success",
      title: "Folder is created",
    })
  }

  // Delete Collection
  const deleteCollection = (id: string) => {
    deleteFolder(id)
    toast({
      variant: "success",
      title: `${collection.type} is deleted`,
    })
    router.push("/")
  }

  // Add folder
  const addFolder: SubmitHandler<z.infer<typeof CollectionSchema>> = (data) => {
    let folder: FolderType = {
      name: data.collectionName,
      id: uuid(),
      isOpen: true,
      type: "folder",
    }
    createFolder(folder, collection.id)
    if (params.api[0] === collection.id) {
      router.push("/")
    }
  }

  // Create API
  const createApiHandler: SubmitHandler<ApiType> = (data) => {
    data.id = uuid()
    data.params = isEmpty(data.params!) ? [] : data.params
    data.headers = isEmpty(data.headers!) ? [] : data.headers
    data.body = isEmpty(data.body!) ? [] : data.body

    createApi(data, collection.id)
    toast({
      variant: "success",
      title: "Api is created",
    })
    router.push(`/api/${collection.id}/${data.id}`)
  }

  // Update Api
  const updateApiHandler: SubmitHandler<ApiType> = (data) => {
    data.params = isEmpty(data.params!) ? [] : data.params
    data.headers = isEmpty(data.headers!) ? [] : data.headers
    data.body = isEmpty(data.body!) ? [] : data.body
    updateApi(data, data.id)
    toast({
      variant: "success",
      title: "Api is updated",
    })
    router.push(`/api/${collection.id}/${data.id}`)

    setApiDetails({} as ApiType)
  }

  // Delete Collection
  const deleteApiHandler = (id: string) => {
    deleteApi(id)
    toast({
      variant: "success",
      title: `Api is deleted`,
    })
    if (params.api[1] === id) {
      router.push("/")
    }
  }
  // Export as JSON
  const downloadFile = ({
    data,
    fileName,
    fileType,
  }: {
    data: FolderType
    fileName: string
    fileType: string
  }) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([JSON.stringify(data)], { type: fileType })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement("a")
    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }

  const folderDropDownMenu: {
    name: React.ReactNode | string
    onClick: (e: any) => void
  }[] = [
      {
        name: "Env Variables",
        onClick: (e) => { },
      },
      {
        name: "Add Request",
        onClick: (e) => {
          e?.stopPropagation()
          addApiButtonRef.current?.click()
        },
      },
      {
        name: "Add Folder",
        onClick: (e) => {
          e?.stopPropagation()
          addFolderButtonRef.current?.click()
        },
      },
      {
        name: "Rename",
        onClick: (e) => {
          e?.stopPropagation()
          buttonRef.current?.click()
        },
      },

      {
        name: "Export",
        onClick: (e) => {
          e?.stopPropagation()
        },
      },
      {
        name: (
          <InputFile
            collectionId={collection.id !== "undefined" ? collection.id : ""}
            className="w-full justify-start border-0 bg-transparent py-0 pl-0 text-left hover:bg-secondary"
          >
            Import
          </InputFile>
        ),
        onClick: (e) => {
          e?.stopPropagation()
        },
      },
      {
        name: "Delete",
        onClick: (e) => {
          e?.stopPropagation()
          deleteButtonRef.current?.click()
        },
      },
    ]

  return (
    <>
      <div
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "group relative w-full cursor-pointer items-center justify-between rounded-none"
        )}
        onClick={() => {
          updateFolder(
            { ...collection, isOpen: !collection.isOpen },
            collection.id
          )
        }}
      >
        <div className="flex h-7 items-center">
          <ChevronRight
            size={15}
            className={
              (collection.isOpen ? "rotate-90" : "") +
              " transition-all duration-100 ease-linear mr-3"
            }
          />
          <FolderClosed size={14} className="mr-2" />
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
              if (collection.type === "collection") {
                return (
                  <DropdownMenuItem
                    key={uuid()}
                    onClick={(e) => {
                      item.onClick(e)
                      if (item.name === "Export") {
                        downloadFile({
                          data: collection,
                          fileName: collection.name + ".json",
                          fileType: "text/json",
                        })
                      }
                    }}
                  >
                    {item.name}
                  </DropdownMenuItem>
                )
              } else {
                return (
                  <DropdownMenuItem
                    key={uuid()}
                    onClick={(e) => {
                      item.onClick(e)
                      if (item.name === "Export") {
                        downloadFile({
                          data: collection,
                          fileName: collection.name + ".json",
                          fileType: "text/json",
                        })
                      }
                    }}
                  >
                    {item.name}
                  </DropdownMenuItem>
                )
              }
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {collection.isOpen && (
        <div className="animate__animated animate__fadeIn child ml-6 border-l">
          {collection?.children?.map((folder) => (
            <RenderNavigation collection={folder} key={folder.id} />
          ))}
          {collection.apis?.map((api) => (
            <div
              key={api.id}
              onClick={() => router.push(`/api/${collection.id}/${api.id}`)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "xs" }),
                "group relative w-full cursor-pointer items-center justify-between rounded-none"
              )}
            >
              <div className="flex items-center">
                <span
                  className={
                    (api.method === "GET"
                      ? "text-green-500"
                      : api.method === "POST"
                        ? "text-yellow-500"
                        : api.method === "PUT"
                          ? "text-blue-500"
                          : api.method === "PATCH"
                            ? "text-purple-500"
                            : "text-destructive") + " font-bold mr-2 text-xs"
                  }
                >
                  {api.method}
                </span>
                {api.name}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <MoreVertical
                    className="opacity-20 group-hover:opacity-100"
                    size={18}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      setApiDetails(api)
                      e.stopPropagation()
                      router.push("/")
                      updateApiButtonRef.current?.click()
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
        <AddCollectionDialog type={collection.type} onSubmit={addFolder}>
          <button ref={addFolderButtonRef}>click</button>
        </AddCollectionDialog>
      </div>

      {/* Updated API request Dialog */}
      <div className="hidden">
        <AddApiDialog
          details={apiDetails}
          folderId={collection.id}
          onCreateApi={updateApiHandler}
        >
          <button ref={updateApiButtonRef}>click</button>
        </AddApiDialog>
      </div>

      {/* Add API request Dialog */}
      <div className="hidden">
        <AddApiDialog folderId={collection.id} onCreateApi={createApiHandler}>
          <button ref={addApiButtonRef}>click</button>
        </AddApiDialog>
      </div>

      {/* Delete Dialog */}
      <AlertDialog>
        <AlertDialogTrigger className="hidden" ref={deleteButtonRef}>
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
                size: "xs",
                variant: "outline",
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
                variant: "destructive",
                size: "xs",
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
