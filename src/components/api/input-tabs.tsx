import { useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import { arrayToObjectConversion } from '@/lib/utils'
import { ApiType, ParamsType } from '@/types/api'

import MultipleInput from '../multiple-input'
import ResultRender from '../result-renderer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { JSONErrorType } from './api'

type PropsType = {
  form: UseFormReturn<ApiType, any, undefined>
  api?: ApiType
  className?: string
  height?: number | string
}

export default function InputTabs({ form, api, height, className }: PropsType) {
  const jsonBodyDivRef = useRef<HTMLDivElement>(null)
  const [jsonBodyData, setJsonBodyData] = useState<any>({})
  const [jsonError, setJsonError] = useState<JSONErrorType>()
  const [defaultOpen, setDefaultOpen] = useState<string>('params')

  const setJsonBody = (data: string) => {
    try {
      setJsonBodyData(JSON.parse(data))
      const jsonData = JSON.parse(data)
      const jsonArray = [] as ParamsType[]

      Object.keys(jsonData).map((item) => {
        const data = { key: item, value: jsonData[item] as any, id: uuid() }
        jsonArray.push(data)
      })

      form.setValue('body', jsonArray)

      setJsonError({
        isError: false,
        error: '',
      })
    } catch (error: any) {
      setJsonError({
        isError: true,
        error: error.message,
      })
    }
  }

  useEffect(() => {
    if (api?.id && api?.body?.length) {
      setJsonBodyData(arrayToObjectConversion(api!.body!))
    } else {
      setJsonBodyData({})
    }
  }, [api])

  useEffect(() => {
    setDefaultOpen(
      api && api?.body?.length
        ? 'body'
        : api?.headers?.length
        ? 'headers'
        : api?.params?.length
        ? 'params'
        : api?.dynamicVariables?.length
        ? 'dynamicVariable'
        : 'params',
    )
  }, [api])

  return (
    <div className={className}>
      <Tabs
        defaultValue={defaultOpen}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="params">
            Params{' '}
            {api?.params?.length || api?.pathVariables?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="headers">
            Headers{' '}
            {api?.headers?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}{' '}
          </TabsTrigger>
          <TabsTrigger value="body">
            Body{' '}
            {api?.body?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="dynamicVariable">
            Set variables
            {api?.dynamicVariables?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="params"
          className="animate__animated animate__fadeIn"
          style={{
            maxHeight:
              (height as number) >= 300
                ? (height as number) - 200
                : (height as number),
          }}
        >
          <Tabs
            defaultValue="queryParams"
            className="w-full"
          >
            <TabsList className="px-.5 h-9">
              <TabsTrigger
                value="queryParams"
                className="h-7"
              >
                Query Params
                {api?.params?.length ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
              <TabsTrigger
                value="urlParams"
                className="h-7"
              >
                URL Params
                {api?.pathVariables?.length ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="queryParams"
              className="animate__animated animate__fadeIn"
              style={{
                height:
                  (height as number) >= 300
                    ? (height as number) - 300
                    : (height as number),
              }}
            >
              <MultipleInput
                propertyName="params"
                form={form}
              />
            </TabsContent>
            <TabsContent
              value="urlParams"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight:
                  (height as number) >= 300
                    ? (height as number) - 230
                    : (height as number),
              }}
            >
              <MultipleInput
                propertyName="pathVariables"
                form={form}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent
          value="headers"
          className="animate__animated animate__fadeIn overflow-auto"
          style={{
            maxHeight:
              (height as number) >= 300
                ? (height as number) - 200
                : (height as number),
          }}
        >
          <MultipleInput
            propertyName="headers"
            form={form}
          />
        </TabsContent>
        <TabsContent
          value="body"
          className="animate__animated animate__fadeIn"
        >
          <Tabs
            defaultValue="x-www-form-urlencoded"
            className="w-full"
          >
            <TabsList className="px-.5 h-9">
              <TabsTrigger
                value="x-www-form-urlencoded"
                className="h-7"
              >
                x-www-form-urlencoded
              </TabsTrigger>
              <TabsTrigger
                value="raw"
                className="h-7"
              >
                Raw JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="raw"
              className="animate__animated animate__fadeIn"
              style={{
                height:
                  (height as number) >= 300
                    ? (height as number) - 300
                    : (height as number),
              }}
            >
              <div className="flex items-center justify-between">
                {jsonError?.isError ? (
                  <div className="h-4 text-xs font-bold text-red-500">
                    {jsonError.error}
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
              </div>
              <ResultRender
                ref={jsonBodyDivRef}
                result={jsonBodyData}
                height={
                  height && (height as number) >= 300
                    ? (height as number) - 230
                    : !height
                    ? window.innerHeight - 320
                    : (height as number)
                }
                readOnly={false}
                setData={setJsonBody}
                className="border-t pt-3"
              />
            </TabsContent>
            <TabsContent
              value="x-www-form-urlencoded"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight:
                  (height as number) >= 300
                    ? (height as number) - 230
                    : (height as number),
              }}
            >
              <MultipleInput
                propertyName="body"
                form={form}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent
          value="dynamicVariable"
          className="animate__animated animate__fadeIn overflow-auto my-5"
          style={{
            maxHeight:
              (height as number) >= 300
                ? (height as number) - 200
                : (height as number),
          }}
        >
          <MultipleInput
            propertyName="dynamicVariables"
            form={form}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
