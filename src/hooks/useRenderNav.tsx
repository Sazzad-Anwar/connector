import React, { useEffect, useRef, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { toast } from '../components/ui/use-toast'
import { downloadFile, updateRecentlyOpenedApis } from '../lib/utils'
import useCreatingFolderStore from '../store/createFolder'
import useApiStore from '../store/store'
import useTabRenderStore from '../store/tabView'
import { ApiType, CollectionSchema, FolderType } from '../types/api'
import useImportJSON from './useImportJSON'

export default function useRenderNav({
  collection,
}: {
  collection: FolderType
}) {
  const navigate = useNavigate()
  const params = useParams()
  const { InputFile } = useImportJSON()
  const [apiDetails, setApiDetails] = useState<ApiType>()
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const { updateFolder, deleteFolder, createFolder, deleteApi, createApi } =
    useApiStore()
  const [selectedApis, setSelectedApis] = useState<ApiType[]>([])
  const [collectionId, setCollectionId] = useState<string>('')
  const { isCreatingFolder, setIsCreatingFolder } = useCreatingFolderStore()
  const [isEnvDialogOpen, setIsEnvDialogOpen] = useState(false)
  const [isFolderOpen, setIsFolderOpen] = useState(true)
  const [isFolderNameUpdating, setIsFolderNameUpdating] = useState(false)
  const [isMoveToFolderDialogOpen, setIsMoveToFolderDialogOpen] =
    useState(false)
  const { addTab, tabs, updateTab } = useTabRenderStore()

  // Rename collection
  const renameCollectionName: SubmitHandler<
    z.infer<typeof CollectionSchema>
  > = (data: z.infer<typeof CollectionSchema>) => {
    const updateData = { ...collection, name: data.collectionName }
    updateFolder(updateData, collection.id)
    setIsFolderNameUpdating(false)

    toast({
      variant: 'success',
      title: 'Success',
      description: `${data.collectionName} is renamed successfully`,
    })
  }

  // Delete Collection
  const deleteCollection = (id: string) => {
    updateTab(updateRecentlyOpenedApis(tabs, collection))
    deleteFolder(id)
    toast({
      variant: 'success',
      title: `Success`,
      description: `${collection.name} is deleted successfully`,
    })
    navigate('/')
  }

  // Add folder
  const addFolder: SubmitHandler<z.infer<typeof CollectionSchema>> = (data) => {
    const folder: FolderType = {
      name: data.collectionName,
      id: uuid(),
      type: 'folder',
      children: [],
      apis: [],
    }
    createFolder(folder, collection.id)
    setIsCreatingFolder(false)
    if (params.collectionId === collection.id) {
      navigate('/')
    }
  }

  // Delete Collection
  const deleteApiHandler = (id: string) => {
    updateTab(updateRecentlyOpenedApis(tabs, collection))
    deleteApi(id)
    const tab = tabs.find((t) => t.id === params.apiId)
    if (!tab) {
      navigate('/')
    } else {
      const nextTab =
        tabs.indexOf(tab) === 0
          ? tabs[tabs.indexOf(tab) + 1]
          : tabs[tabs.indexOf(tab) - 1]

      navigate(`/api/${nextTab.folderId}/${nextTab.id}`)
    }
    toast({
      variant: 'success',
      title: `Success`,
      description: `${apiDetails?.name} Api is deleted successfully`,
    })
  }

  const addApi = () => {
    let data: ApiType = {
      id: uuid(),
      url: 'https://example.com',
      name: 'New Api',
      method: 'GET',
      params: [],
      headers: [],
      dynamicVariables: [],
      body: [],
      pathVariables: [],
    }
    createApi(data, collection.id)
    navigate(`/api/${collection.id}/${data.id}`, {
      state: {
        isUrlEditing: true,
        isApiNameEditing: true,
      },
    })
    addTab({
      id: data.id,
      name: data.name,
      folderId: collection.id,
      isActive: true,
    })
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
        setIsEnvDialogOpen(true)
      },
      isHidden: collection.type === 'folder',
    },
    {
      name: 'Add Request',
      onClick: (e) => {
        e?.stopPropagation()
        addApi()
      },
    },
    {
      name: 'Add Folder',
      onClick: (e) => {
        e?.stopPropagation()
        setCollectionId(collection.id)
        setIsCreatingFolder(true)
        setIsFolderOpen(true)
      },
    },
    {
      name: 'Rename',
      onClick: (e) => {
        e?.stopPropagation()
        setIsFolderNameUpdating(true)
        setCollectionId(collection.id)
        // buttonRef.current?.click()
      },
    },

    {
      name: 'Export',
      onClick: () => {
        downloadFile({
          data: collection,
          fileName: collection.name + '.json',
          fileType: 'text/json',
        })
      },
    },
    {
      name: 'Delete',
      onClick: () => {
        deleteButtonRef.current?.click()
      },
    },
  ]

  useEffect(() => {
    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        setIsFolderNameUpdating(false)
        setCollectionId('')
        setIsCreatingFolder(false)
        setIsCreatingFolder(false)
        setIsEnvDialogOpen(false)
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

  const handleClickApi = (
    event: React.MouseEvent<HTMLButtonElement>,
    api: ApiType,
  ) => {
    if (event.ctrlKey || event.metaKey) {
      if (selectedApis.map((a) => a.id).includes(api.id)) {
        setSelectedApis(selectedApis.filter((a) => a.id !== api.id))
      } else {
        setSelectedApis([...selectedApis, api])
      }
    } else {
      addTab({
        id: api.id,
        name: api.name,
        folderId: collection.id,
        isActive: true,
      })
      navigate(`/api/${collection.id}/${api.id}#${api.id}`)
    }
  }

  return {
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
    setSelectedApis,
    collectionId,
    setCollectionId,
    isCreatingFolder,
    setIsCreatingFolder,
    isFolderNameUpdating,
    setIsFolderNameUpdating,
    isMoveToFolderDialogOpen,
    setIsMoveToFolderDialogOpen,
    handleClickApi,
    downloadFile,
    isEnvDialogOpen,
    setIsEnvDialogOpen,
    isFolderOpen,
    setIsFolderOpen,
  }
}
