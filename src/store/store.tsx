import { create } from 'zustand'

import { ApiType, FolderType, ParamsType } from '@/types/api'
import { getParentIdForNthChildren, search } from '../lib/utils'

type Store = {
  collections: FolderType[]
  api: ApiType
  env: ParamsType[]
  updateCollection: (data: FolderType, id: string) => void
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
  for (const folder of folders) {
    if (folder.id === id) {
      switch (actionType) {
        case 'create':
          folder.children = [...(folder.children ?? []), data!]
          break
        case 'update':
          Object.assign(folder, data)
          break
        case 'delete':
          return folders.filter((f) => f.id !== id)
      }
      return folders
    } else if (folder.children && folder.children.length > 0) {
      const updatedChildren = actionsInNestedFolder(
        folder.children,
        id,
        actionType,
        data,
      )
      if (updatedChildren !== folder.children) {
        folder.children = updatedChildren
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
function updateApiFunction(
  arr: FolderType[],
  apiId: string,
  updatedApiData: ApiType,
): FolderType[] {
  let updated = false // Initialize a flag to track changes

  const updatedArr = arr.map((current) => {
    let updatedApis = current.apis

    // If the current folder contains APIs, we check for a match with the provided apiId
    if (current.apis && current.apis.length > 0) {
      updatedApis = current.apis.map((api: ApiType) => {
        if (api.id === apiId) {
          updated = true // Set the flag to true as an update is made
          return { ...api, ...updatedApiData } // Merge the current API with the updated data
        }
        return api // Return unchanged API if ID doesn't match
      })
    }

    let updatedChildren = current.children

    // Recursively update children if they exist
    if (current.children && current.children.length > 0) {
      updatedChildren = updateApiFunction(
        current.children,
        apiId,
        updatedApiData,
      )
      if (updatedChildren !== current.children) {
        updated = true // Set the flag to true if children were updated
      }
    }

    // If either apis or children were updated, return the updated object
    if (updated) {
      return { ...current, apis: updatedApis, children: updatedChildren }
    }
    return current // Return unchanged folder object if no updates
  })

  return updated ? updatedArr : arr // Return updated array or original if no updates were made
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
  updateCollection: (data, id) => {
    let collections: FolderType[] = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    collections = collections.map((collection) => {
      if (collection.id === id) {
        return data
      }
      return collection
    })
    set(() => ({
      collections,
    }))
    isLocalStorageAvailable() &&
      localStorage.setItem('collections', JSON.stringify(collections))
  },
  createFolder: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem('collections')! : '[]',
    )
    if (typeof id !== 'undefined') {
      collections = actionsInNestedFolder(collections, id!, 'create', data)
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
      collections = updateApiFunction(collections, id, data)
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
