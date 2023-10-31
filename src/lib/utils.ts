import QueryString from 'qs'
import { twMerge } from 'tailwind-merge'

import { FolderType, ParamsType } from '@/types/api'
import clsx, { ClassValue } from 'clsx'

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

  if (!arr?.find((item) => item.key === '')) {
    for (const i in arr) {
      newObject[arr[i].key] = arr[i].value
    }
  }

  return newObject
}

export function isEmpty(arr: ParamsType[]) {
  return arr?.find((item) => item.key === '')
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
    properties = properties.filter((item) => item !== 'response')
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
  const values: string[] = []
  if (params?.length) {
    params.forEach((item, index) => {
      values[index] = item.value
    })

    const baseURL = url

    // Construct URL based on the index order
    const finalURL = baseURL + '/' + values.join('/')

    return finalURL
  } else {
    return url
  }
}
