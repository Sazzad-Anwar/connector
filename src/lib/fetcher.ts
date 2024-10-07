/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetch } from '@tauri-apps/plugin-http'
import axios from 'axios'
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
      Array.from(file.value).map((item: any) => {
        formData.append(file.key, item)
      })
    })
  }
  Object.keys(requestBody).map((item) => {
    if (!files?.find((file) => file.key === item)) {
      formData.append(item, requestBody[item])
    }
  })
  try {
    const response = await fetch(url, {
      method,
      body: method !== 'GET' ? (isUpload ? formData : requestBody) : undefined,
      headers,
    })
    return await response.json()
  } catch (error) {
    console.log(error)
    return await axios({
      url,
      method,
      data: isUpload ? formData : requestBody,
      headers,
    })
  }
}

export default fetcher
