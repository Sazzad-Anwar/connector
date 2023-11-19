import { create } from 'zustand'

import { ApiType, FolderType, ParamsType } from '@/types/api'
import { getParentIdForNthChildren, search } from '../lib/utils'

type Store = {
  collections: FolderType[]
  api: ApiType
  env: ParamsType[]
  getCollections: () => void
  searchApi: (id: string) => void
  createFolder: (data: FolderType, id?: string) => void
  createApi: (data: ApiType, id: string) => void
  updateFolder: (data: FolderType, id: string) => void
  getApi: (id: string) => void
  getEnv: (folderId: string) => void
  updateEnv: (
    data: FolderType[],
    id: string,
    updatedParam: ParamsType[],
  ) => void
  updateApi: (data: ApiType, id: string) => void
  deleteFolder: (id: string) => void
  deleteApi: (id: string) => void
}

export function isLocalStorageAvailable() {
  return typeof window !== 'undefined' && window.localStorage
}

function actionsInNestedFolder(
  folders: FolderType[],
  id: string,
  actionType: 'create' | 'update' | 'delete',
  data?: FolderType,
) {
  for (let i = 0; i < folders.length; i++) {
    const current = folders[i]
    if (current.id === id) {
      if (actionType === 'create') {
        current.children = [...(current.children ?? []), data!]
      } else if (actionType === 'update') {
        Object.assign(current, data)
      } else if (actionType === 'delete') {
        folders.splice(i, 1)
      }
      return folders // Return the updated array
    } else if (current.children && current.children.length > 0) {
      const updatedChildren = actionsInNestedFolder(
        current.children,
        id,
        actionType,
        data,
      )
      if (updatedChildren !== current.children) {
        // If the children array was updated, return the updated object
        current.children = updatedChildren
        return folders
      }
    }
  }
  return folders // Return the original array if no changes were made
}

// Add an API
function addApi(folders: FolderType[], id: string, api?: ApiType) {
  for (let i = 0; i < folders.length; i++) {
    const current = folders[i]

    if (current.id === id) {
      current.apis = [...(current.apis ?? []), api!]
      return folders // Return the updated array
    } else if (current.children && current.children.length > 0) {
      const updatedChildren = addApi(current.children, id, api)
      if (updatedChildren !== current.children) {
        // If the children array was updated, return the updated object
        current.children = updatedChildren
        return folders
      }
    }
  }
  return folders // Return the original array if no changes were made
}

// Update an API
function updateApi(
  arr: FolderType[],
  apiId: string,
  updatedApiData: ApiType,
): FolderType[] {
  let updated = false // Initialize a flag to track changes

  const updatedArr = arr.map((current) => {
    if (current.apis && current.apis.length > 0) {
      const updatedApis = current.apis.map((api) => {
        if (api.id === apiId) {
          // If the API is found, update its properties with updatedApiData
          updated = true // Set the flag to true as an update is made
          return { ...api, ...updatedApiData }
        }
        return api // Return the unchanged API if the ID doesn't match
      })

      if (updated) {
        // If the 'apis' array was updated, return the updated object
        return { ...current, apis: updatedApis }
      }
    }

    if (current.children && current.children.length > 0) {
      const updatedChildren = updateApi(current.children, apiId, updatedApiData)
      if (updatedChildren !== current.children) {
        updated = true // Set the flag to true if 'children' array was updated
        return { ...current, children: updatedChildren }
      }
    }
    return current // Return the unchanged object if no updates were made
  })
  return updated ? updatedArr : arr // Return the original array if no changes were made
}

// Delete Api
function deleteApi(arr: FolderType[], apiId: string) {
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]

    if (current.apis && current.apis.length > 0) {
      for (let j = 0; j < current.apis.length; j++) {
        if (current.apis[j].id === apiId) {
          // Remove the API object from the array
          current.apis.splice(j, 1)
          return arr // Return the updated array
        }
      }
    }

    if (current.children && current.children.length > 0) {
      const updatedChildren = deleteApi(current.children, apiId)
      if (updatedChildren !== current.children) {
        // If the children array was updated, return the updated object
        current.children = updatedChildren
        return arr
      }
    }
  }

  return arr // Return the original array if no changes were made
}

function getApiDetailsById(arr: FolderType[], apiId: string): ApiType | null {
  if (!arr?.length) {
    return null
  }
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]

    if (current.apis && current.apis.length > 0) {
      for (let j = 0; j < current.apis.length; j++) {
        const api = current.apis[j]

        if (api.id === apiId) {
          return api // Return the API object
        }
      }
    }

    if (current.children && current.children.length > 0) {
      const apiDetails = getApiDetailsById(current.children, apiId)
      if (apiDetails) {
        // If the API details are found in the children, return them
        return apiDetails
      }
    }
  }

  return null // Return null if the API is not found
}

//find Variables list from parent
function findParentEnvInArray(
  folder: FolderType[],
  childId: string,
): ParamsType[] | null {
  let result: FolderType | undefined = undefined

  function findParentAndCollect(child: FolderType, path: FolderType[]) {
    path.push(child)

    if (child.id === childId) {
      result = path[0] // The first element in the path is the root parent
      return
    }

    if (child.children) {
      for (const subChild of child.children) {
        findParentAndCollect(subChild, path.slice()) // Create a new path for each child
      }
    }
  }
  if (folder && folder.length) {
    for (const item of folder) {
      findParentAndCollect(item, [])
      if (result) {
        break // If the root parent is found, exit the loop
      }
    }
  } else {
    return null
  }

  return result!.env!
}

const useApiStore = create<Store>()((set) => ({
  collections: [],
  api: {} as ApiType,
  env: [],
  getCollections: () => {
    const collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    set(() => ({
      collections,
    }))
  },
  createFolder: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    if (id) {
      collections = actionsInNestedFolder(collections, id, 'create', data)
    } else {
      collections = collections?.length ? [...collections, data] : [data]
    }
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },
  updateEnv: (data, id, updatedParam) => {
    const parentId = getParentIdForNthChildren(data, id)

    const collections = data.map((collection) => {
      if (collection.id === parentId) {
        collection.env = updatedParam
      }
      return collection
    })
    set(() => ({
      collections,
    }))
    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },
  getEnv: (folderId) => {
    const collections: FolderType[] = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    const variables = findParentEnvInArray(collections, folderId)
    set(() => ({
      env: variables ?? [],
    }))
  },

  searchApi: (name) => {
    let collections: FolderType[] = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    collections = search(collections, name)
    set(() => ({
      collections,
    }))
  },

  getApi: (id) => {
    const collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    const api = getApiDetailsById(collections, id) ?? ({} as ApiType)
    set(() => ({
      api,
    }))
  },

  createApi: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    if (id) {
      collections = addApi(collections, id, data)
    } else {
      collections = collections?.length ? [...collections, data] : [data]
    }
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },

  updateFolder: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    collections = actionsInNestedFolder(collections, id, 'update', data)
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },

  updateApi: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    if (id) {
      collections = updateApi(collections, id, data)
    } else {
      collections = [...collections, data]
    }

    set(() => ({
      collections,
    }))
    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },
  deleteFolder: (id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    collections = actionsInNestedFolder(collections, id, 'delete')
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },

  deleteApi: (id: string) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    collections = deleteApi(collections, id)

    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },
}))

export default useApiStore
