"use client"
import React, { useRef, useState } from "react"

import { SideNav } from "./navigations"
import RenderNavigation from "./render-navigation"
import { Button } from "../ui/button"
import { Braces, MoveRight, Plus, Upload } from "lucide-react"
import * as z from 'zod';
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "../ui/use-toast"
import useApiStore from "@/store/store"
import { v4 as uuid } from 'uuid'
import { FolderType } from '../../types/api'
import AddCollectionDialog from "./add-collection-dialog"
import { MainNav } from "../main-nav"
import { Input } from "../ui/input"
import useImportJSON from "@/hooks/useImportJSON"
import { cn } from "@/lib/utils"
import useSidepanelToggleStore from "@/store/sidePanelToggle"

export const CollectionSchema = z.object({
  collectionName: z.string().min(3, { message: 'Collection name should be more than 3 characters' }),
})

type PropsType = {
  isLoadingInSheet?: boolean
}

export default function SideNav({ isLoadingInSheet }: PropsType) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { InputFile } = useImportJSON()
  const { isOpen } = useSidepanelToggleStore()
  const [search, setSearch] = useState<string>('');
  const { collections, createFolder, findOneFolder } = useApiStore()
  const form = useForm<z.infer<typeof CollectionSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CollectionSchema)
  })

  const onSubmit: SubmitHandler<z.infer<typeof CollectionSchema>> = (data) => {
    let folder: FolderType = {
      name: data.collectionName,
      type: 'collection',
      isOpen: true,
      id: uuid(),
    }
    createFolder(folder);
    buttonRef.current?.click();
    form.reset();
    toast({
      variant: "success",
      title: "Collection is saved",
    })
  }

  const Navigation = () => {
    return <div className="h-full overflow-auto">
      <MainNav />
      <div className="mb-3 flex items-center px-4 pb-0 pt-2">
        <AddCollectionDialog type="collection" onSubmit={onSubmit}>
          <Button variant="outline" size="xs" className="px-2 py-1">
            <Plus size={16} />
          </Button>
        </AddCollectionDialog>
        <Input
          className="mx-2 h-7 rounded"
          value={search}
          placeholder="Search"
          onChange={e => {
            setSearch(e.target.value);
            findOneFolder(e.target.value)
          }}
        />
        <InputFile variant="outline" size="xs">
          <Braces size={16} />
        </InputFile>
      </div>
      {!collections?.length && <div className="flex h-96 w-full items-center justify-center">
        <h1 className="opacity-40">No Collection Found</h1>
      </div>}
      {collections?.map(collection => <RenderNavigation key={collection.id} collection={collection} />)}
    </div>
  }

  return (
    <aside
      className={cn("relative h-screen overflow-hidden border-r bg-background ", isLoadingInSheet ? "w-full" : "w-0", isOpen ? "lg:w-[250px] xl:w-[300px]" : "hidden")}
    >
      <Navigation />
    </aside>
  )
}
