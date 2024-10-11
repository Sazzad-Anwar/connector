/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetch as TFetch } from '@tauri-apps/plugin-http'
import { platform } from '@tauri-apps/plugin-os'
import { ParamsType } from '../types/api'

const fetcher = async ({
  url,
  method,
  requestBody,
  headers,
  isUpload,
  submitDataBody,
}: {
  url: string
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH'
  requestBody: any
  headers?: any
  isUpload?: boolean
  submitDataBody?: ParamsType[]
}) => {
  const formData = new FormData()
  const files = submitDataBody?.filter((item) => item?.type === 'file')
  if (files?.length) {
    files.map((file) => {
      Array.from(file.value)?.map((item: any) => {
        formData.append(file.key, item)
      })
    })
  }
  Object.keys(requestBody)?.map((item) => {
    if (!files?.find((file) => file.key === item)) {
      formData.append(item, requestBody[item])
    }
  })
  const requestConfigs = {
    method,
    body: isUpload ? formData : JSON.stringify(requestBody),
    headers,
  }
  if (isUpload) {
    requestConfigs['headers'] = {
      'Content-Type': 'multipart/form-data',
    }
  } else {
    requestConfigs['headers'] = {
      'Content-Type': 'application/json',
    }
  }
  try {
    platform()
    return await TFetch(url, requestConfigs)
  } catch (error) {
    return await fetch(url, requestConfigs)
  }
}

export default fetcher
