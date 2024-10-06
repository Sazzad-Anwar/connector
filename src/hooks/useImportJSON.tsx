/* eslint-disable @typescript-eslint/no-explicit-any */
import useApiStore from '@/store/store'
import React from 'react'
import { v4 as uuid } from 'uuid'

import { buttonVariants } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  CollectionParsingSchema,
  FolderParsingSchema,
  FolderType,
} from '@/types/api'

export type InputFileType = {
  children: React.ReactNode
  className?: string
  variant?: 'ghost' | 'secondary' | 'link' | 'outline' | 'success'
  size?: 'lg' | 'sm' | 'xs' | 'icon'
  importOn?: 'root' | 'collection'
  collectionId?: string
  id: string
}

export default function useImportJSON() {
  const { createFolder } = useApiStore()

  const readJsonFile = (file: Blob) =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader()

      fileReader.onload = (event) => {
        if (event.target) {
          try {
            const parsedData = JSON.parse(event.target.result as string)
            resolve(parsedData)
          } catch (error) {
            reject('Invalid JSON format')
          }
        }
      }

      fileReader.onerror = (error) => reject(error)
      fileReader.readAsText(file)
    })

  const onFileChange = async (e: any, id?: string) => {
    if (e.target?.files) {
      try {
        const data = await readJsonFile(e.target.files[0])
        let parsedData = data as FolderType
        id
          ? await CollectionParsingSchema.parse(data)
          : await FolderParsingSchema.parse(data)
        parsedData.id = uuid()
        parsedData.type = parsedData?.type ?? 'folder'

        if (!!id && parsedData.type === 'folder') {
          createFolder(parsedData, id)
          toast({
            variant: 'success',
            title: 'Success',
            description: 'Imported successfully',
          })
        } else if (parsedData.type === 'collection') {
          createFolder(parsedData)
          toast({
            variant: 'success',
            title: 'Success',
            description: 'Imported successfully',
          })
        } else {
          toast({
            variant: 'error',
            title: 'Error',
            description:
              'Folder schema can not be imported in root. Import in collection only.',
          })
        }
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: Array.isArray(JSON.parse((error as Error).message))
            ? JSON.parse((error as Error).message)
                .map(
                  (err: any) =>
                    `${err.path[0].toUpperCase()} ${err.message} \n`,
                )
                .join(', ') + '\n\n'.concat('. Please import a valid JSON')
            : (error as Error).message,
        })
      }
    }

    e.target.value = '' // Clear file input
  }

  const InputFile = ({
    children,
    className,
    variant,
    size,
    importOn,
    collectionId,
    id,
  }: InputFileType) => {
    return (
      <label
        className={cn(
          buttonVariants({
            variant: variant ?? 'default',
            size: size ?? 'default',
          }),
          'cursor-pointer px-2 py-1',
          className,
        )}
        htmlFor={id}
      >
        <input
          id={id}
          className="hidden"
          type="file"
          accept="application/JSON"
          onChange={(e) => {
            if (importOn === 'collection') {
              onFileChange(e, collectionId)
            } else {
              onFileChange(e)
            }
          }}
        />

        {children}
      </label>
    )
  }

  return { onFileChange, InputFile }
}
