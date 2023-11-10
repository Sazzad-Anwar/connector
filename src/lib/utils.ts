import QueryString from 'qs'
import { twMerge } from 'tailwind-merge'

import { FolderType, ParamsType } from '@/types/api'
import clsx, { ClassValue } from 'clsx'
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

  if (
    !arr?.find((item) => item.key === '') ||
    !arr?.find((item) => !item.isActive)
  ) {
    for (const i in arr) {
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
  let baseURL = url
  let queryString = ''

  // Find and replace path variables in the URL
  if (params?.length) {
    params.forEach((item) => {
      baseURL = baseURL.replace(`:${item.key}`, item.value)
    })
  }

  // Separate query string if exists
  const urlParts = baseURL.split('?')
  if (urlParts.length > 1) {
    baseURL = urlParts[0]
    queryString = urlParts[1]
  }

  // Construct URL based on the index order
  if (queryString) {
    const updatedURL = baseURL + '/' + values.join('/') + '?' + queryString
    return updatedURL.endsWith('/') ? updatedURL.slice(0, -1) : updatedURL
  } else {
    const updatedURL = baseURL + '/' + values.join('/')

    return updatedURL.endsWith('/') ? updatedURL.slice(0, -1) : updatedURL
  }
}

const pathVariableMatcher = /\/:(?![0-9])[^/?]+/g

export function parseURLParameters(url: string) {
  const regex = pathVariableMatcher
  const parameters = []
  let match

  while ((match = regex.exec(url)) !== null) {
    if (match.index > url.indexOf('?') && url.includes('?')) {
      break // Stop parsing if the URL contains a query string and the match is after '?'
    }

    parameters.push({
      id: 'uuid', // This will be filled later based on your data
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
    const params = queryString.split('&')

    params.forEach((param) => {
      const keyValue = param.split('=')
      if (keyValue.length === 2) {
        parameters.push({
          id: uuid(),
          key: keyValue[0],
          value: keyValue[1],
        })
      }
    })
  }

  return parameters
}

export function generateURLFromParams(url: string, params: ParamsType[]) {
  let newURL = url

  if (params && params.length && !params.find((item) => item.key === '')) {
    params.forEach((param, index) => {
      if (index + 1 !== params.length && !url?.includes(`/:${param?.key}`)) {
        newURL = newURL.replace(
          `/:${param?.key}`,
          `/:${param?.key}/:${params[index + 1]?.key}`,
        )
      } else {
        newURL =
          newURL + (!url?.includes(`/:${param?.key}`) ? `/:${param?.key}` : '')
      }
    })

    const keysInURL = new Set(newURL?.match(pathVariableMatcher))

    params.forEach((param) => {
      if (!keysInURL.has(`/:${param.key}`)) {
        newURL = newURL?.replace(pathVariableMatcher, `/:${param.key}`)
      }
    })
    return newURL
  } else {
    const queryPortion = newURL?.split('?')?.length
      ? newURL?.split('?')[1] ?? ''
      : ''

    newURL =
      queryPortion !== ''
        ? newURL?.split('/:')[0] + '?' + queryPortion
        : newURL?.split('/:')[0]
    return newURL
  }
}

// this function will filter the url and remove ':pathVar' which are not includes in Params array
export function filterURLWithParams(url: string, params: ParamsType[]) {
  const keysInArray = params?.map((param) => `/:${param.key}`)
  const regex = pathVariableMatcher
  const matchedKeys = url?.match(regex)

  if (matchedKeys) {
    const keysInURL = new Set(matchedKeys)
    const unusedKeys = [...keysInURL].filter(
      (key) => !keysInArray.includes(key),
    )

    unusedKeys.forEach((unusedKey) => {
      url = url.replace(unusedKey, '') // Remove unused keys from the URL
    })

    // Clean up any leftover slashes from removed parameters
    url = url
      .replace(/\/{2,}/g, '/')
      .replace(/\?&/, '?')
      .replace(/\?$/, '')

    // Remove trailing slash if present at the end
    if (url.endsWith('/')) {
      url = url.slice(0, -1)
    }

    return url
  }

  return url
}
