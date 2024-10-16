import { useEffect, useState } from 'react'

import useImportJSON from '@/hooks/useImportJSON'
import { cn } from '@/lib/utils'
import useSidePanelToggleStore from '@/store/sidePanelToggle'
import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileJson2, Folder, Plus } from 'lucide-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'
import * as z from 'zod'
import { useDebounce } from '../../hooks/useDebounce'
import useCreatingFolderStore from '../../store/createFolder'
import { CollectionSchema, FolderType } from '../../types/api'
import CreateFolder from '../collections/create-folder'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { toast } from '../ui/use-toast'
import RenderNavigation from './render-navigations'
import { SideNavHeader } from './sidenav-header'

type PropsType = {
  isLoadingInSheet?: boolean
}

export default function SideNav({ isLoadingInSheet }: PropsType) {
  const { InputFile } = useImportJSON()
  const { isOpen } = useSidePanelToggleStore()
  const [search, setSearch] = useState<string>('')
  const { setIsCreatingFolder, isCreatingCollection, setIsCreatingCollection } =
    useCreatingFolderStore()
  const { collections, createFolder, searchApi, getCollections } = useApiStore()
  const debouncedValue = useDebounce(search, 700)
  const form = useForm<z.infer<typeof CollectionSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CollectionSchema),
  })

  const onSubmit: SubmitHandler<z.infer<typeof CollectionSchema>> = (data) => {
    const folder: FolderType = {
      name: data.collectionName,
      type: 'collection',
      id: uuid(),
    }
    createFolder(folder)
    setIsCreatingFolder(false)
    form.reset()
    toast({
      variant: 'success',
      title: 'Success',
      description: 'Collection is saved successfully',
    })
  }

  useEffect(() => {
    if (!!debouncedValue) {
      searchApi(debouncedValue)
    } else {
      getCollections()
    }
  }, [debouncedValue, searchApi])

  useEffect(() => {
    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        setIsCreatingFolder(false)
        setIsCreatingCollection(false)
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
    <aside
      className={cn(
        'relative min-h-screen overflow-hidden border-r bg-background',
        isLoadingInSheet
          ? 'w-full'
          : isOpen
          ? 'w-full animate__animated animate__fadeInLeft animate__faster'
          : 'w-0 animate__animated animate__fadeInRight animate__faster',
      )}
    >
      <div className="h-full overflow-auto">
        <SideNavHeader />
        <div className="mb-3 flex items-center px-4 pb-0 pt-2">
          <Button
            variant="outline"
            size="xs"
            className="p-1"
            onClick={() => setIsCreatingCollection(true)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Plus size={16} />
              </TooltipTrigger>
              <TooltipContent>Create Collection</TooltipContent>
            </Tooltip>
          </Button>
          <Input
            className="mx-1 px-2 h-7 rounded"
            value={search}
            placeholder="Search"
            onChange={(e) => {
              setSearch(e.target.value)
            }}
          />
          <InputFile
            id={uuid()}
            importOn="root"
            variant="outline"
            size="xs"
            className="p-1"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <FileJson2 size={16} />
              </TooltipTrigger>
              <TooltipContent align="end">Import Collection</TooltipContent>
            </Tooltip>
          </InputFile>
        </div>
        <div className="max-h-[calc(100vh-106px)] overflow-auto pb-5 relative">
          {!collections?.length && !isCreatingCollection && (
            <div className="flex flex-col h-[calc(100vh-126px)] w-full items-center justify-center">
              <Folder
                size={60}
                className="opacity-40"
              />
              <h1 className="opacity-40">No Collection Found</h1>
            </div>
          )}
          {collections?.map((collection: FolderType) => (
            <RenderNavigation
              key={collection.id}
              collection={collection}
            />
          ))}
          {isCreatingCollection && (
            <CreateFolder
              name={''}
              onSubmit={onSubmit}
              type="collection"
              actionType={'create'}
            />
          )}
        </div>
      </div>
    </aside>
  )
}
