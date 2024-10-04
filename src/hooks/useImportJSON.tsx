/* eslint-disable @typescript-eslint/no-explicit-any */
import useApiStore from '@/store/store'
import React from 'react'
import { v4 as uuid } from 'uuid'

import { buttonVariants } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { FolderType } from '@/types/api'

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

  // Validator to check if the structure matches FolderType
  const isValidCollectionType = (data: any): boolean => {
    const isValidEnv = (env: any): boolean =>
      Array.isArray(env) &&
      env.every(
        (e: any) =>
          typeof e.id === 'string' &&
          typeof e.key === 'string' &&
          typeof e.value === 'string',
      )

    const isValidApis = (apis: any): boolean =>
      Array.isArray(apis) &&
      apis.every(
        (api: any) =>
          typeof api.id === 'string' &&
          typeof api.name === 'string' &&
          typeof api.url === 'string' &&
          typeof api.method === 'string',
      )

    const isValidChildren = (children: any): boolean =>
      Array.isArray(children) &&
      children.every(
        (child: any) =>
          typeof child.id === 'string' &&
          typeof child.name === 'string' &&
          child.type === 'collection' && // Ensure valid types
          isValidApis(child.apis) &&
          isValidChildren(child.children),
      )

    return (
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      data.type === 'collection' && // Ensure valid types
      isValidEnv(data.env) &&
      isValidChildren(data.children) &&
      isValidApis(data.apis)
    )
  }

  const isValidFolderType = (data: any): boolean => {
    const isValidApis = (apis: any): boolean =>
      Array.isArray(apis) &&
      apis.every(
        (api: any) =>
          typeof api.id === 'string' &&
          typeof api.name === 'string' &&
          typeof api.url === 'string' &&
          typeof api.method === 'string',
      )

    const isValidChildren = (children: any): boolean =>
      Array.isArray(children) &&
      children.every(
        (child: any) =>
          typeof child.id === 'string' &&
          typeof child.name === 'string' &&
          child.type === 'folder' && // Ensure valid types
          isValidApis(child.apis) &&
          isValidChildren(child.children),
      )

    return (
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      data.type === 'folder' && // Ensure valid types
      isValidChildren(data.children) &&
      isValidApis(data.apis)
    )
  }

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
        const parsedData = (await readJsonFile(e.target.files[0])) as FolderType

        // Validate FolderType structure
        if (!isValidFolderType(parsedData) && id) {
          throw new Error('Invalid file structure. Please upload a valid JSON.')
        }

        if (!isValidCollectionType(parsedData) && !id) {
          throw new Error('Invalid file structure. Please upload a valid JSON.')
        }

        // Add additional logic for assigning default values and creating the folder
        parsedData.id = uuid()
        parsedData.type = parsedData?.type ?? 'folder'

        if (id) {
          createFolder(parsedData, id)
        } else {
          createFolder(parsedData)
        }

        toast({
          variant: 'success',
          title: 'Success',
          description: 'Imported successfully',
        })
      } catch (error) {
        toast({
          variant: 'error',
          title: 'Error',
          description: (error as Error).message,
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
