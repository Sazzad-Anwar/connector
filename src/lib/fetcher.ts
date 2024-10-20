/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetch as TFetch } from '@tauri-apps/plugin-http'
import { platform } from '@tauri-apps/plugin-os'
import { ParamsType } from '../types/api'

const fetcher = async ({
  url,
  method,
  requestBody,
  headers,
  contentType,
}: {
  url: string
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  requestBody: any
  headers?: any
  contentType?:
    | 'multipart/form-data'
    | 'application/json'
    | 'application/x-www-form-urlencoded'
}) => {
  const formData = new FormData()
  const files =
    Array.isArray(requestBody) &&
    requestBody?.filter((item: ParamsType) => item?.type === 'file')
  if (contentType === 'multipart/form-data') {
    if (files && files?.length) {
      files.forEach((file: ParamsType) => {
        Array.from(file.value)?.map((item: any) => {
          formData.append(file.key, item)
        })
      })
    }
    requestBody?.forEach((item: ParamsType) => {
      formData.append(item.key, item.value)
    })
  }
  const requestConfigs = {
    method,
    body:
      method === 'GET'
        ? undefined
        : contentType === 'multipart/form-data'
        ? formData
        : contentType === 'application/x-www-form-urlencoded'
        ? new URLSearchParams(requestBody)
        : JSON.stringify(requestBody),
    headers:
      contentType === 'multipart/form-data'
        ? {
            ...headers,
          }
        : {
            ...headers,
            'Content-Type': contentType,
          },
  }

  try {
    platform()
    return await TFetch(url, requestConfigs)
  } catch (error) {
    return await fetch(url, requestConfigs)
  }
}

export default fetcher
