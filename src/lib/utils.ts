/* eslint-disable no-dupe-else-if */
/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryString from 'qs'
import { twMerge } from 'tailwind-merge'

import { ApiType, FolderType, ParamsType, TabType } from '@/types/api'
import clsx, { ClassValue } from 'clsx'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBreadcrumbsForNthChildren(arr: FolderType[], id: string) {
  let breadcrumbs: string[] = []

  function findObjectAndCollectNames(
    currentArr: FolderType[],
    currentPath: string[],
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

export function getParentIdForNthChildren(arr: FolderType[], id: string) {
  let breadcrumbs: string[] = []

  function findObjectAndCollectNames(
    currentArr: FolderType[],
    currentPath: string[],
  ) {
    for (let i = 0; i < currentArr.length; i++) {
      const current = currentArr[i]
      const newPath = [...currentPath, current.id]

      if (current.id === id) {
        breadcrumbs = newPath
        return
      } else if (current.children && current.children.length > 0) {
        findObjectAndCollectNames(current.children, newPath)
      }
    }
  }

  findObjectAndCollectNames(arr, [])

  return breadcrumbs[0]
}

export function arrayToObjectConversion(arr: ParamsType[]) {
  const newObject = {} as { [key: string]: any }
  for (const i in filterEmptyParams(arr)) {
    if (arr[i].isActive) {
      newObject[arr[i].key] = arr[i].value
    }
  }

  return newObject
}

export function isEmpty(arr: ParamsType[]) {
  return arr?.find((item) => item.key === '')
}

export function filterEmptyParams(arr: ParamsType[]) {
  return arr?.filter((item) => item.key !== '')
}

export function getQueryString(
  params: { [key: string]: string },
  env?: ParamsType[],
) {
  if (env && env.length) {
    Object.keys(params).map((item) => {
      if (
        containsDynamicVariable(params[item]) &&
        containsVariable(params[item], env)
      ) {
        params[item] = replaceVariables(params[item], env)
      } else if (
        containsDynamicVariable(params[item]) &&
        containsVariable(params[item], env)
      ) {
        delete params[item]
      }
    })
  }

  return QueryString.stringify(params, { encodeValuesOnly: true })
}

export function replaceVariables(
  inputString: string,
  replacements: ParamsType[],
): string {
  return replacements.reduce((result, { key, value }) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    return result.replace(regex, value)
  }, inputString)
}

export function containsVariable(
  inputString: string,
  replacements: ParamsType[],
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

  return '' // Return null if no match is found
}

export function getRootParentIdForNthChildren(arr: FolderType[], id: string) {
  let ids: string[] = []

  function findObjectAndCollectNames(
    currentArr: FolderType[],
    currentPath: string[],
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

export function updateEnvWithDynamicVariableValue(
  dynamicVars: ParamsType[],
  envVars: ParamsType[],
  result: any,
) {
  dynamicVars.forEach((dynamicVar) => {
    if (dynamicVar.key.startsWith('{{') && dynamicVar.key.endsWith('}}')) {
      const key = dynamicVar.key.substring(2, dynamicVar.key.length - 2)
      const envVarToUpdate = envVars.find((envVar) => envVar.key === key)

      if (envVarToUpdate) {
        envVarToUpdate.value = resolveQuery(dynamicVar.value, result)
      }
    }
  })
  return envVars
}

export function resolveQuery(queryString: string, data: any) {
  let properties = queryString.split('.') // Split query string by '.'

  let result = data
  if (Array.isArray(result)) {
    for (const property of properties) {
      if (Array.isArray(result)) {
        // If the data is an array
        const index = parseInt(property.replace(/\D/g, ''), 10)
        result = result[index]
      } else if (result && typeof result === 'object') {
        result = result[property]
      } else {
        result = undefined
        break // Break the loop if encountered an undefined result
      }
    }
  } else if (result && typeof result === 'object') {
    properties = properties.filter((item) => item.toLowerCase() !== 'response')
    for (const property of properties) {
      result = property !== 'response' ? result[property] ?? '' : ''
    }
  } else {
    result = undefined
  }
  return result
}

export function checkAndReplaceWithDynamicVariable(
  params: { [key: string]: string },
  env: ParamsType[],
) {
  Object.keys(params).map((item) => {
    if (
      containsDynamicVariable(params[item]) &&
      containsVariable(params[item], env)
    ) {
      params[item] = replaceVariables(params[item], env)
    } else if (
      containsDynamicVariable(params[item]) &&
      containsVariable(params[item], env)
    ) {
      delete params[item]
    }
  })
  return params
}

export function updateUrlWithPathVariables(url: string, params: ParamsType[]) {
  let baseURL = url

  // Replace path variables in the URL
  params?.forEach((item) => {
    baseURL = baseURL.replace(`:${item.key}`, item.value)
  })

  // Split URL to handle query string
  const [path, queryString] = baseURL.split('?')

  // Clean up trailing slash and return
  return queryString
    ? `${path}?${queryString}`.replace(/\/$/, '')
    : path.replace(/\/$/, '')
}

const pathVariableMatcher = /\/:(?![0-9])[^/?]+/g

export function parseURLParameters(url: string) {
  const parameters: ParamsType[] = []
  let match

  // Extract path variables from the URL
  while ((match = pathVariableMatcher.exec(url)) !== null) {
    if (url.includes('?') && match.index > url.indexOf('?')) break // Stop at query string

    parameters.push({
      id: uuid(), // This will be filled later based on your data
      key: match[0].substring(2), // Extracting the parameter key without '/:'
      value: '',
      description: '',
    })
  }

  return parameters
}

export function parseURLQueryParameters(url: string) {
  const parameters: ParamsType[] = []
  const queryString = url?.split('?')[1]

  if (queryString) {
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      parameters.push({
        id: uuid(), // Generate unique ID
        key,
        value,
      })
    })
  }

  return parameters
}

export function generateURLFromParams(url: string, params: ParamsType[]) {
  let newURL = url

  if (params?.length) {
    params.forEach((param) => {
      if (!url.includes(`/:${param.key}`)) {
        newURL += `/:${param.key}`
      }
    })

    const keysInURL = new Set(newURL.match(pathVariableMatcher))
    params.forEach((param) => {
      if (!keysInURL.has(`/:${param.key}`)) {
        newURL = newURL.replace(pathVariableMatcher, `/:${param.key}`)
      }
    })
  }

  const queryPortion = url?.includes('?') ? newURL.split('?')[1] || '' : ''
  newURL = queryPortion
    ? `${newURL.split('/:')[0]}?${queryPortion}`
    : newURL?.split('/:')[0]

  return newURL
}

// this function will filter the url and remove ':pathVar' which are not includes in Params array
export function filterURLWithParams(url: string, params: ParamsType[]) {
  const keysInArray = params.map((param) => `/:${param.key}`)
  const matchedKeys = url.match(pathVariableMatcher)

  if (matchedKeys) {
    matchedKeys.forEach((key) => {
      if (!keysInArray.includes(key)) {
        url = url.replace(key, '') // Remove unused keys from the URL
      }
    })

    // Clean up slashes and query string
    url = url
      .replace(/\/{2,}/g, '/')
      .replace(/\?&/, '?')
      .replace(/\?$/, '')

    // Remove trailing slash if present
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  return url
}

export function search(
  collections: FolderType[] | undefined, // Handle undefined here
  query: string,
): FolderType[] {
  // Ensure collections is an array, or return an empty array if it's not
  if (!Array.isArray(collections)) {
    return []
  }

  const results: FolderType[] = []
  const queryLower = query.toLowerCase()

  for (const item of collections) {
    // Filter APIs that match the query
    const matchingApis = item?.apis?.filter((api) =>
      api.name.toLowerCase().includes(queryLower),
    )

    // Search within children recursively
    const matchingChildren = search(item.children, query)

    // If there are matching APIs or children, include the current folder in the results
    if (matchingApis?.length! > 0 || matchingChildren?.length! > 0) {
      results.push({
        ...item,
        apis: matchingApis, // Only keep matching APIs
        children: matchingChildren, // Only keep matching children
        isOpen: true,
      })
    }
  }

  return results
}

export function parseCookie(cookie: string) {
  const getCookieData = (cookieKey: string) => {
    if (
      cookie.split(';').find((item) => item.includes(cookieKey)) &&
      cookie
        .split(';')
        .find((item) => item.includes(cookieKey))
        ?.trim()
        .split('=')[1]
    ) {
      return cookie
        .split(';')
        .find((item) => item.includes(cookieKey))
        ?.trim()
        .split('=')[1]
    } else if (
      cookie.split(';').find((item) => item.includes(cookieKey)) &&
      !cookie
        .split(';')
        .find((item) => item.includes(cookieKey))
        ?.trim()
        ?.includes('=')
    ) {
      return true
    } else {
      return false
    }
  }

  const customKey = cookie.split(';')[0]?.split('=')[0]
  const customValue = cookie.split(';')[0]?.split('=')[1]
  const maxAge = getCookieData('Max-Age')
  const expires = dayjs(getCookieData('Expires') as string).format(
    'DD ddd MMM YYYY HH:mm:ss',
  )
  const path = getCookieData('Path')
  const secure = getCookieData('Secure')
  const httpOnly = getCookieData('HttpOnly')
  const sameSite = getCookieData('SameSite')

  return {
    customKey,
    customValue,
    maxAge,
    expires,
    path,
    secure,
    httpOnly,
    sameSite,
  }
}

export const findParentFolderById = (
  structure: any,
  folderId: string,
): FolderType | null => {
  // If the current node has children, search recursively in each child
  if (structure.children && structure.children.length > 0) {
    for (const child of structure.children) {
      // Base case: check if one of the children matches the folder ID
      if (child.id === folderId && child.type === 'folder') {
        return structure // Return the current folder as the parent
      }

      // Recursive search in the child's children
      const result = findParentFolderById(child, folderId)
      if (result) {
        return result // Return the found parent
      }
    }
  }

  // Return null if no matching folder or parent is found
  return null
}

export const moveApisToFolder = (
  structure: FolderType,
  targetFolderId: string,
  apiIds: string[],
): FolderType | null => {
  // Store found APIs and remove them from their original location
  let foundApis: ApiType[] = []

  const removeApisFromFolder = (folder: FolderType) => {
    // Remove APIs from the current folder
    if (folder?.apis) {
      folder.apis = folder.apis.filter((api: ApiType) => {
        if (apiIds.includes(api.id)) {
          foundApis.push(api)
          return false // Remove this ApiType from the folder
        }
        return true // Keep this ApiType in the folder
      })
    }

    // Recursively check child folders
    if (folder?.children && folder.children.length > 0) {
      folder.children.forEach(removeApisFromFolder)
    }
  }

  // Remove APIs from their original locations
  removeApisFromFolder(structure)

  // Function to find the target folder by its ID and move APIs there
  const addApisToTargetFolder = (folder: FolderType): boolean => {
    if (folder?.id === targetFolderId && folder.type === 'folder') {
      // Add the found APIs to the target folder's apis array
      folder.apis = folder?.apis?.concat(foundApis)
      return true
    }

    // Recursively search in child folders
    if (folder?.children && folder.children.length > 0) {
      for (const child of folder.children) {
        if (addApisToTargetFolder(child)) {
          return true // Stop search once folder is found
        }
      }
    }

    return false
  }

  // Add APIs to the target folder
  const success = addApisToTargetFolder(structure)

  if (success) {
    return structure // Return the updated jsonData if successful
  } else {
    return {} as FolderType // Return null if the operation failed
  }
}

export const findFolderByIdInCollections = (
  collections: FolderType[],
  folderId: string,
): { folder: FolderType; parent?: FolderType } | null => {
  for (const collection of collections) {
    const result = findFolderById(collection, folderId)
    if (result) {
      return result
    }
  }
  return null
}

export const findFolderById = (
  structure: FolderType,
  folderId: string,
): { folder: FolderType; parent?: FolderType } | null => {
  // Base case: if the folder with folderId is found
  if (structure.id === folderId) {
    return { folder: structure }
  }

  // If it has children, search recursively
  if (structure.children && structure.children.length > 0) {
    for (const child of structure.children) {
      const result = findFolderById(child, folderId)
      if (result) {
        return { folder: result.folder, parent: structure }
      }
    }
  }

  return null // If no matching folder is found
}

export const findRootCollection = (
  collections: FolderType[],
  folderId: string,
): FolderType | null => {
  // Find the folder by its ID in the array of collections
  const folderData = findFolderByIdInCollections(collections, folderId)

  if (!folderData) {
    console.log('Folder not found')
    return null
  }

  // Traverse upwards until we find the root collection
  let currentFolder = folderData.parent || folderData.folder

  while (currentFolder && currentFolder.type !== 'collection') {
    const parentData = findFolderByIdInCollections(
      collections,
      currentFolder.id,
    )
    currentFolder = parentData?.parent || currentFolder
  }

  return currentFolder && currentFolder.type === 'collection'
    ? currentFolder
    : null
}

// Function to update recently opened APIs based on deleted collection
export function updateRecentlyOpenedApis(
  recentlyOpenedApis: TabType[],
  deletedCollection: FolderType,
): TabType[] {
  // Create an array to collect all API IDs that should be removed (from the deleted collection)
  const apiIdsToRemove: string[] = []

  if (deletedCollection?.children && deletedCollection.children.length > 0) {
    deletedCollection?.children?.forEach((folder: FolderType) => {
      if (folder?.children && folder.children.length > 0) {
        folder.children.forEach((child: FolderType) => {
          updateRecentlyOpenedApis(recentlyOpenedApis, child)
        })
      } else {
        folder?.apis?.forEach((api) => {
          apiIdsToRemove.push(api.id)
        })
      }
    })
  } else {
    deletedCollection.apis?.forEach((api) => {
      apiIdsToRemove.push(api.id)
    })
  }

  // Iterate through the folders in the deleted collection and collect their API IDs

  // Filter the recently opened APIs and remove the ones whose id is in apiIdsToRemove
  return recentlyOpenedApis.filter((api) => !apiIdsToRemove.includes(api.id))
}
