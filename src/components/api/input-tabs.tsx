/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { ApiType, ParamsType } from '@/types/api'

import { useLocation } from 'react-router-dom'
import useResultRenderViewStore from '../../store/resultRenderView'
import Loading from '../loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
const MultipleInput = lazy(() => import('../multiple-input'))
const ResultRender = lazy(() => import('../result-renderer'))

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
  const location = useLocation()
  const jsonBodyDivRef = useRef<HTMLDivElement>(null)
  const [jsonBodyData, setJsonBodyData] = useState<any>({})
  const [interactiveQueryData, setInteractiveQueryData] = useState<any>({})
  const [isTimedOut, setTimedOut] = useState<boolean>(false)
  const [activeBodyPayloadType, setActiveBodyPayloadType] = useState<
    'x-form-urlencoded' | 'json' | 'form-data'
  >()
  const [defaultOpen, setDefaultOpen] = useState<string>('params')
  const { resultRenderView } = useResultRenderViewStore()

  const setJsonBody = (data: string) => {
    try {
      setJsonBodyData(JSON.parse(data))
      const jsonData = JSON.parse(data)

      if (activeBodyPayloadType === 'json') {
        form.setValue('jsonBody', jsonData, { shouldDirty: true })
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  const setInteractiveQuery = (data: string) => {
    try {
      const jsonData = JSON.parse(data)
      setInteractiveQueryData(jsonData)
      form.setValue('interactiveQuery', jsonData, { shouldDirty: true })
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
  }, [api])

  useEffect(() => {
    setDefaultOpen(
      (api && api?.body?.find((item: ParamsType) => item.isActive)) ||
        (api && api?.formData?.find((item: ParamsType) => item.isActive)) ||
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
      api?.formData?.find((item: ParamsType) => item.isActive)
        ? 'form-data'
        : api?.body?.find((item: ParamsType) => item.isActive)
        ? 'x-form-urlencoded'
        : 'json',
    )
  }, [])

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
            (api?.jsonBody && Object.keys(api?.jsonBody).length) ||
            api?.formData?.find((item: ParamsType) => item.isActive) ? (
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
        >
          <Tabs
            defaultValue={
              api?.params?.find((item: ParamsType) => item.isActive)
                ? 'query-params'
                : typeof api?.interactiveQuery === 'object' &&
                  Object.keys(api?.interactiveQuery).length
                ? 'interactive-query'
                : api?.pathVariables?.find(
                    (item: ParamsType) => item.key === '',
                  )
                ? 'url-params'
                : 'interactive-query'
            }
            className="w-full"
          >
            <TabsList className="px-.5 h-9">
              <TabsTrigger
                onClick={() => {
                  form.setValue('activeQuery', 'query-params')
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
                  form.setValue('activeQuery', 'url-params')
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
                maxHeight: (height as number) - 95,
              }}
            >
              <Suspense fallback={<Loading />}>
                <MultipleInput
                  propertyName="params"
                  form={form}
                />
              </Suspense>
            </TabsContent>
            <TabsContent
              value="url-params"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight: height as number,
              }}
            >
              <Suspense fallback={<Loading />}>
                <MultipleInput
                  propertyName="pathVariables"
                  form={form}
                  params={api?.pathVariables}
                />
              </Suspense>
            </TabsContent>
            <TabsContent
              value="interactive-query"
              className="animate__animated animate__fadeIn"
              style={{
                height: (height as number) - (type === 'create' ? 96 : 0),
              }}
            >
              {isTimedOut ? (
                <Suspense
                  fallback={
                    <Loading
                      height={
                        (height as number) -
                        (location.pathname.includes('/add') ||
                        location.pathname.includes('/update')
                          ? 105
                          : resultRenderView === 'horizontal'
                          ? 115
                          : 55)
                      }
                    />
                  }
                >
                  <ResultRender
                    ref={jsonBodyDivRef}
                    result={interactiveQueryData}
                    height={
                      (height as number) -
                      (location.pathname.includes('/add') ||
                      location.pathname.includes('/update')
                        ? 105
                        : resultRenderView === 'horizontal'
                        ? 115
                        : 55)
                    }
                    readOnly={false}
                    setData={setInteractiveQuery}
                  />
                </Suspense>
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
          <Suspense fallback={<Loading />}>
            <MultipleInput
              propertyName="headers"
              form={form}
            />
          </Suspense>
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
                value="form-data"
                className="h-7"
                onClick={() => {
                  setActiveBodyPayloadType('form-data')
                  form.setValue('activeBody', 'form-data')
                }}
              >
                Form Data{' '}
                {api?.formData?.find((item: ParamsType) => item.isActive) ? (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
                ) : null}
              </TabsTrigger>
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
              {isTimedOut ? (
                <Suspense
                  fallback={
                    <Loading
                      height={
                        (height as number) -
                        (resultRenderView === 'vertical' ? 55 : 115)
                      }
                    />
                  }
                >
                  <ResultRender
                    ref={jsonBodyDivRef}
                    result={jsonBodyData}
                    height={
                      (height as number) -
                      (resultRenderView === 'vertical' ? 55 : 115)
                    }
                    readOnly={false}
                    setData={setJsonBody}
                  />
                </Suspense>
              ) : (
                <Loading />
              )}
            </TabsContent>
            <TabsContent
              value="form-data"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight: height as number,
              }}
            >
              <Suspense fallback={<Loading />}>
                <MultipleInput
                  propertyName="formData"
                  form={form}
                />
              </Suspense>
            </TabsContent>
            <TabsContent
              value="x-form-urlencoded"
              className="animate__animated animate__fadeIn relative overflow-auto"
              style={{
                maxHeight: height as number,
              }}
            >
              <Suspense fallback={<Loading />}>
                <MultipleInput
                  propertyName="body"
                  form={form}
                />
              </Suspense>
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
          <Suspense fallback={<Loading />}>
            <MultipleInput
              propertyName="dynamicVariables"
              form={form}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InputTabs
