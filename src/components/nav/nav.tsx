import { useRef, useState } from 'react'

import useImportJSON from '@/hooks/useImportJSON'
import { cn } from '@/lib/utils'
import useSidePanelToggleStore from '@/store/sidePanelToggle'
import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Braces, Plus } from 'lucide-react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'
import * as z from 'zod'
import { FolderType } from '../../types/api'
import AddCollectionDialog from '../collections/add-collection-dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from '../ui/use-toast'
import RenderNavigation from './render-navigations'
import { SideNavHeader } from './sidenav-header'

export const CollectionSchema = z.object({
  collectionName: z
    .string()
    .min(3, { message: 'Collection name should be more than 3 characters' }),
})

type PropsType = {
  isLoadingInSheet?: boolean
}

export default function SideNav({ isLoadingInSheet }: PropsType) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { InputFile } = useImportJSON()
  const { isOpen } = useSidePanelToggleStore()
  const [search, setSearch] = useState<string>('')
  const { collections, createFolder, findOneFolder } = useApiStore()
  const form = useForm<z.infer<typeof CollectionSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CollectionSchema),
  })

  const onSubmit: SubmitHandler<z.infer<typeof CollectionSchema>> = (data) => {
    const folder: FolderType = {
      name: data.collectionName,
      type: 'collection',
      isOpen: true,
      id: uuid(),
    }
    createFolder(folder)
    buttonRef.current?.click()
    form.reset()
    toast({
      variant: 'success',
      title: 'Collection is saved',
    })
  }

  return (
    <aside
      className={cn(
        'relative h-screen overflow-hidden border-r bg-background ',
        isLoadingInSheet ? 'w-full' : isOpen ? 'w-full' : 'w-0',
        // isOpen ? 'lg:w-[250px] xl:w-[300px]' : 'hidden',
        // isOpen ? 'w-full ' : 'hidden',
      )}
    >
      <div className="h-full overflow-auto">
        <SideNavHeader />
        <div className="mb-3 flex items-center px-4 pb-0 pt-2">
          <AddCollectionDialog
            type="collection"
            onSubmit={onSubmit}
          >
            <Button
              variant="outline"
              size="xs"
              className="p-1"
            >
              <Plus size={16} />
            </Button>
          </AddCollectionDialog>
          <Input
            className="mx-2 h-7 rounded"
            value={search}
            placeholder="Search"
            onChange={(e) => {
              setSearch(e.target.value)
              findOneFolder(e.target.value)
            }}
          />
          <InputFile
            variant="outline"
            size="xs"
            className="p-1"
          >
            <Braces size={16} />
          </InputFile>
        </div>
        {!collections?.length && (
          <div className="flex h-96 w-full items-center justify-center">
            <h1 className="opacity-40">No Collection Found</h1>
          </div>
        )}
        {collections?.map((collection: FolderType) => (
          <RenderNavigation
            key={collection.id}
            collection={collection}
          />
        ))}
      </div>
    </aside>
  )
}
