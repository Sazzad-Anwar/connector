import { clsx, type ClassValue } from "clsx"
import QueryString from "qs"
import { twMerge } from "tailwind-merge"

import { FolderType, ParamsType } from "@/types/api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBreadcrumbsForNthChildren(arr: FolderType[], id: string) {
  let breadcrumbs: string[] = []

  function findObjectAndCollectNames(
    currentArr: FolderType[],
    currentPath: string[]
  ) {
    for (let i = 0; i < currentArr.length; i++) {
      const current = currentArr[i]
      const newPath = [...currentPath, current.name]

      if (current.id === id) {
        breadcrumbs = newPath
        return
      } else if (current.children && current.children.length > 0) {
        findObjectAndCollectNames(current.children, newPath)
      }
    }
  }

  findObjectAndCollectNames(arr, [])
  return breadcrumbs
}

export function arrayToObjectConversion(arr: ParamsType[]) {
  let newObject = {} as { [key: string]: any }

  if (!arr?.find((item) => item.key === "")) {
    for (let i in arr) {
      newObject[arr[i].key] = arr[i].value
    }
  }

  return newObject
}

export function isEmpty(arr: ParamsType[]) {
  return arr?.find((item) => item.key === "")
}

export function getQueryString(params: { [key: string]: string }) {
  return QueryString.stringify(params, { encodeValuesOnly: true })
}

export function replaceVariables(
  inputString: string,
  replacements: ParamsType[]
): string {
  return replacements.reduce((result, { key, value }) => {
    const regex = new RegExp(`{{${key}}}`, "g")
    return result.replace(regex, value)
  }, inputString)
}

export function containsVariable(
  inputString: string,
  replacements: ParamsType[]
): boolean {
  return replacements?.some(({ key }) => inputString?.includes(`{{${key}}}`))
}

export function containsDynamicVariable(inputString: string): boolean {
  const regex = /{{(.*?)}}/g
  return regex.test(inputString)
}

export function extractVariable(inputString: string): string {
  const regex = /{{(.*?)}}/

  const match = regex.exec(inputString)
  if (match && match[1]) {
    return match[1]
  }

  return "" // Return null if no match is found
}

export function getRootParentIdForNthChildren(arr: FolderType[], id: string) {
  let ids: string[] = []

  function findObjectAndCollectNames(
    currentArr: FolderType[],
    currentPath: string[]
  ) {
    for (let i = 0; i < currentArr.length; i++) {
      const current = currentArr[i]
      const newPath = [...currentPath, current.id]

      if (current.id === id) {
        ids = newPath
        return
      } else if (current.children && current.children.length > 0) {
        findObjectAndCollectNames(current.children, newPath)
      }
    }
  }

  findObjectAndCollectNames(arr, [])
  return ids[0]
}
