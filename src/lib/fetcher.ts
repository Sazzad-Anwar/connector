/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponseType, getClient } from '@tauri-apps/api/http'
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
    const client = await getClient()
    if (isUpload) {
      return await axios({
        url,
        method,
        data: formData,
        headers,
      })
    } else {
      switch (method) {
        case 'POST':
          return await client.post(
            url,
            { payload: requestBody, type: 'Json' },
            {
              headers,
              responseType: ResponseType.Binary,
            },
          )
        case 'PUT':
          return await client.put(
            url,
            { payload: requestBody, type: 'Json' },
            {
              headers,
              responseType: ResponseType.Binary,
            },
          )
        case 'DELETE':
          return await client.delete(url, {
            headers,
            responseType: ResponseType.Binary,
          })
        case 'PATCH':
          return await client.patch(url, {
            body: {
              payload: requestBody,
              type: 'Json',
            },
            headers,
            responseType: ResponseType.Binary,
          })
        default:
          return await client.get(url, {
            headers,
            responseType: ResponseType.Binary,
          })
      }
    }
  } catch (error) {
    return await axios({
      url,
      method,
      data: isUpload ? formData : requestBody,
      headers,
    })
  }
}

export default fetcher
