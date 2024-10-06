/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { ApiType, ParamsType } from '@/types/api'

import { useNavigate, useSearchParams } from 'react-router-dom'
import useResultRenderViewStore from '../../store/resultRenderView'
import Loading from '../loading'
import MultipleInput from '../multiple-input'
import ResultRender from '../result-renderer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { JSONErrorType } from './api'

type PropsType = {
  form: UseFormReturn<ApiType, any, undefined>
  api?: ApiType
  className?: string
  height?: number | string
  type?: 'create' | 'update'
}

export const InputTabs = ({
  form,
  api,
  height,
  type,
  className,
}: PropsType) => {
  const [searchParams] = useSearchParams()
  const jsonBodyDivRef = useRef<HTMLDivElement>(null)
  const [jsonBodyData, setJsonBodyData] = useState<any>({})
  const [interactiveQueryData, setInteractiveQueryData] = useState<any>({})
  const [isTimedOut, setTimedOut] = useState<boolean>(false)
  const [activeBodyPayloadType, setActiveBodyPayloadType] = useState<
    'x-form-urlencoded' | 'json'
  >()
  const navigate = useNavigate()
  const [jsonError, setJsonError] = useState<JSONErrorType | undefined>()
  const [defaultOpen, setDefaultOpen] = useState<string>('params')
  const { resultRenderView } = useResultRenderViewStore()

  const setJsonBody = (data: string) => {
    try {
      setJsonBodyData(JSON.parse(data))
      const jsonData = JSON.parse(data)

      if (activeBodyPayloadType === 'json') {
        form.setValue('jsonBody', jsonData, { shouldDirty: true })
      }

      setJsonError({
        isError: false,
        error: '',
      })
    } catch (error: any) {
      console.log(error)
    }
  }

  const setInteractiveQuery = (data: string) => {
    try {
      const jsonData = JSON.parse(data)
      setInteractiveQueryData(jsonData)
      form.setValue('interactiveQuery', jsonData, { shouldDirty: true })

      setJsonError({
        isError: false,
        error: '',
      })
    } catch (error: any) {
      // console.log(error)
    }
  }

  useEffect(() => {
    let timer: any
    if (api) {
      timer = setTimeout(() => {
        setTimedOut(true)
        setJsonBodyData(api?.jsonBody)
        setInteractiveQueryData(api?.interactiveQuery)
      }, 100)
    } else {
      setJsonBodyData({})
      setInteractiveQueryData({})
      setTimedOut(true)
    }
    return () => {
      clearTimeout(timer)
      setTimedOut(false)
    }
  }, [api, navigate])

  useEffect(() => {
    setDefaultOpen(
      (api && api?.body?.find((item: ParamsType) => item.isActive)) ||
        (typeof api?.jsonBody === 'object' && Object.keys(api?.jsonBody).length)
        ? 'body'
        : api?.params?.find((item: ParamsType) => item.isActive) ||
          (typeof api?.interactiveQuery === 'object' &&
            Object.keys(api?.interactiveQuery).length)
        ? 'params'
        : api?.headers?.find((item: ParamsType) => item.isActive)
        ? 'headers'
        : api?.dynamicVariables?.find((item: ParamsType) => item.isActive)
        ? 'dynamicVariable'
        : 'params',
    )
    setActiveBodyPayloadType(
      api?.body?.find((item: ParamsType) => item.isActive)
        ? 'x-form-urlencoded'
        : 'json',
    )
  }, [api])

  return (
    <div className={className}>
      <Tabs
        value={defaultOpen}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger
            onClick={() => setDefaultOpen('params')}
            value="params"
          >
            Params{' '}
            {api?.params?.find((item: ParamsType) => item.isActive) ||
            api?.pathVariables?.length ||
            (typeof api?.interactiveQuery === 'object' &&
              Object.keys(api?.interactiveQuery).length) ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setDefaultOpen('headers')}
            value="headers"
          >
            Headers{' '}
            {api?.headers?.find((item: ParamsType) => item.isActive) ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}{' '}
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setDefaultOpen('body')}
            value="body"
          >
            Body{' '}
            {api?.body?.find((item: ParamsType) => item.isActive) ||
            (api?.jsonBody && Object.keys(api?.jsonBody).length) ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setDefaultOpen('dynamicVariable')}
            value="dynamicVariable"
          >
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
            maxHeight: (height as number) + 95,
          }}
        >
          <Tabs
            defaultValue={
              searchParams.get('activeQuery') !== null
                ? (searchParams.get('activeQuery') as
                    | 'query-params'
                    | 'interactive-query')
                : api?.params?.find((item: ParamsType) => item.isActive)
                ? 'query-params'
                : typeof api?.interactiveQuery === 'object' &&
                  Object.keys(api?.interactiveQuery).length
                ? 'interactive-query'
                : api?.pathVariables?.find(
                    (item: ParamsType) => item.key === '',
                  )
                ? 'url-params'
                : 'query-params'
            }
            className="w-full"
          >
            <TabsList className="px-.5 h-9">
              <TabsTrigger
                onClick={() => {
                  form.setValue('activeQuery', 'query-params')
                  navigate({
                    search: searchParams.get('view')
                      ? `activeQuery=query-params&view=${searchParams.get(
                          'view',
                        )}`
                      : `activeQuery=query-params`,
                  })
                }}
                value="query-params"
                className="h-7"
              >
                Query
                {api?.params?.find((item: ParamsType) => item.isActive) ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  form.setValue('activeQuery', 'interactive-query')
                  navigate({
                    search: searchParams.get('view')
                      ? `activeQuery=interactive-query&view=${searchParams.get(
                          'view',
                        )}`
                      : `activeQuery=interactive-query`,
                  })
                }}
                value="interactive-query"
                className="h-7"
              >
                JSON Query
                {typeof api?.interactiveQuery === 'object' &&
                Object.keys(api?.interactiveQuery).length ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  navigate({
                    search: searchParams.get('view')
                      ? `activeQuery=url-params&view=${searchParams.get(
                          'view',
                        )}`
                      : `activeQuery=url-params`,
                  })
                }}
                value="url-params"
                className="h-7"
              >
                Path
                {api?.pathVariables?.length ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="query-params"
              className="animate__animated animate__fadeIn"
              style={{
                height: height as number,
              }}
            >
              <MultipleInput
                propertyName="params"
                form={form}
              />
            </TabsContent>
            <TabsContent
              value="url-params"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight: (height as number) + 95,
              }}
            >
              <MultipleInput
                propertyName="pathVariables"
                form={form}
              />
            </TabsContent>
            <TabsContent
              value="interactive-query"
              className="animate__animated animate__fadeIn"
              style={{
                height: (height as number) - (type === 'create' ? 96 : 0),
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
              {isTimedOut ? (
                <ResultRender
                  ref={jsonBodyDivRef}
                  result={interactiveQueryData}
                  height={
                    (height as number) -
                    (resultRenderView === 'horizontal' ? 115 : 55)
                  }
                  readOnly={false}
                  setData={setInteractiveQuery}
                  setError={setJsonError}
                  className="border-t pt-3"
                />
              ) : (
                <Loading />
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent
          value="headers"
          className="animate__animated animate__fadeIn overflow-auto"
          style={{
            maxHeight: (height as number) + 95,
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
            value={activeBodyPayloadType}
            className="w-full"
          >
            <TabsList className="px-.5 h-9">
              <TabsTrigger
                value="x-form-urlencoded"
                className="h-7"
                onClick={() => {
                  setActiveBodyPayloadType('x-form-urlencoded')
                  form.setValue('activeBody', 'x-form-urlencoded')
                }}
              >
                x-www-form-urlencoded{' '}
                {api?.body?.find((item: ParamsType) => item.isActive) ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
              <TabsTrigger
                value="json"
                className="h-7"
                onClick={() => {
                  setActiveBodyPayloadType('json')
                  form.setValue('activeBody', 'json')
                }}
              >
                JSON{' '}
                {typeof api?.jsonBody === 'object' &&
                Object.keys(api?.jsonBody).length ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="json"
              className="animate__animated animate__fadeIn"
              style={{
                height: (height as number) - (type === 'create' ? 95 : 0),
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
              {isTimedOut ? (
                <ResultRender
                  ref={jsonBodyDivRef}
                  result={jsonBodyData}
                  height={
                    (height as number) -
                    (resultRenderView === 'vertical' ? 105 : 50)
                  }
                  readOnly={false}
                  setData={setJsonBody}
                  className="border-t pt-3"
                  setError={setJsonError}
                />
              ) : (
                <Loading />
              )}
            </TabsContent>
            <TabsContent
              value="x-form-urlencoded"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight: height as number,
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
            maxHeight: height as number,
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

export default InputTabs
