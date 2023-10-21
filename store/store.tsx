import { create } from "zustand"

import { ApiType, FolderType, ParamsType } from "@/types/api"

type Store = {
  collections: FolderType[]
  api: ApiType
  env: ParamsType[]
  findOneFolder: (id: string) => void
  createFolder: (data: FolderType, id?: string) => void
  createApi: (data: ApiType, id: string) => void
  createEnv: (data: ParamsType) => void
  updateFolder: (data: FolderType, id: string) => void
  getApi: (id: string) => void
  getEnv: (apiId: string) => void
  updateApi: (data: ApiType, id: string) => void
  updateEnv: (data: ParamsType, id: string) => void
  deleteFolder: (id: string) => void
  deleteApi: (id: string) => void
  deleteEnv: (id: string) => void
}

export function isLocalStorageAvailable() {
  return typeof window !== "undefined" && window.localStorage
}

function actionsInNestedFolder(
  folders: FolderType[],
  id: string,
  actionType: "create" | "update" | "delete",
  data?: FolderType
) {
  for (let i = 0; i < folders.length; i++) {
    const current = folders[i]
    if (current.id === id) {
      if (actionType === "create") {
        current.children = [...(current.children ?? []), data!]
      } else if (actionType === "update") {
        Object.assign(current, data)
      } else if (actionType === "delete") {
        folders.splice(i, 1)
      }
      return folders // Return the updated array
    } else if (current.children && current.children.length > 0) {
      const updatedChildren = actionsInNestedFolder(
        current.children,
        id,
        actionType,
        data
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
function updateApi(arr: FolderType[], apiId: string, updatedApiData: ApiType) {
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i]

    if (current.apis && current.apis.length > 0) {
      for (let j = 0; j < current.apis.length; j++) {
        const api = current.apis[j]

        if (api.id === apiId) {
          // Update the API object's properties with updatedApiData
          Object.assign(api, updatedApiData)
          return arr // Return the updated array
        }
      }
    }

    if (current.children && current.children.length > 0) {
      const updatedChildren = updateApi(current.children, apiId, updatedApiData)
      if (updatedChildren !== current.children) {
        // If the children array was updated, return the updated object
        current.children = updatedChildren
        return arr
      }
    }
  }

  return arr // Return the original array if no changes were made
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
  dataArray: FolderType[],
  targetApiId: string
): ParamsType[] | null {
  for (const data of dataArray) {
    // Check if any of the parent APIs match the target API ID
    for (const api of data?.apis!) {
      if (api.id === targetApiId) {
        if (data.env) {
          return data.env
        } else {
          return null // If env property is missing in the parent
        }
      }
    }

    // Recursively search in nested children
    if (data.children && data.children.length > 0) {
      const result = findParentEnvInArray(data.children, targetApiId)
      if (result) {
        return result // Return the result if found in a child
      }
    }
  }

  return null // API ID not found in the data array
}

const useApiStore = create<Store>()((set) => ({
  collections: JSON.parse(
    isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
  ),
  api: {} as ApiType,
  env: [],
  createFolder: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    if (id) {
      collections = actionsInNestedFolder(collections, id, "create", data)
    } else {
      collections = collections?.length ? [...collections, data] : [data]
    }
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem("collections", JSON.stringify(collections))
  },

  getEnv: (apiId) => {
    let collections: FolderType[] = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    let variables = findParentEnvInArray(collections, apiId)
    set(() => ({
      env: variables ?? [],
    }))
  },

  findOneFolder: (name) => {
    let collections: FolderType[] = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    collections =
      name !== ""
        ? collections.filter((item) =>
            item.name.toLowerCase().includes(name.toLowerCase())
          )
        : collections
    set(() => ({
      collections,
    }))
  },

  getApi: (id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    let api = getApiDetailsById(collections, id) ?? ({} as ApiType)
    set(() => ({
      api,
    }))
  },

  createApi: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    console.log(collections)
    if (id) {
      collections = addApi(collections, id, data)
    } else {
      collections = collections?.length ? [...collections, data] : [data]
    }
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem("collections", JSON.stringify(collections))
  },

  createEnv: (data) => {},

  updateFolder: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    collections = actionsInNestedFolder(collections, id, "update", data)
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem("collections", JSON.stringify(collections))
  },

  updateApi: (data, id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
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
      localStorage.setItem("collections", JSON.stringify(collections))
  },

  updateEnv: (data, id) => {},

  deleteFolder: (id) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    collections = actionsInNestedFolder(collections, id, "delete")
    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem("collections", JSON.stringify(collections))
  },

  deleteApi: (id: string) => {
    let collections = JSON.parse(
      isLocalStorageAvailable() ? localStorage.getItem("collections")! : "[]"
    )
    collections = deleteApi(collections, id)

    set(() => ({
      collections,
    }))

    isLocalStorageAvailable() &&
      localStorage.setItem("collections", JSON.stringify(collections))
  },

  deleteEnv: (id) => {},
}))

export default useApiStore
