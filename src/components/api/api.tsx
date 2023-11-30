/* eslint-disable @typescript-eslint/no-explicit-any */
import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { platform } from '@tauri-apps/api/os'
import copy from 'copy-to-clipboard'
import { Check, ChevronsRight, Copy, Settings } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import {
  arrayToObjectConversion,
  checkAndReplaceWithDynamicVariable,
  containsDynamicVariable,
  extractVariable,
  filterEmptyParams,
  generateURLFromParams,
  getBreadcrumbsForNthChildren,
  getQueryString,
  isEmpty,
  replaceVariables,
  updateEnvWithDynamicVariableValue,
  updateUrlWithPathVariables,
} from '@/lib/utils'
import { ApiSchema, ApiType } from '@/types/api'

import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SplitPane, { Pane } from 'split-pane-react'
import fetcher from '../../lib/fetcher'
import useSidePanelToggleStore from '../../store/sidePanelToggle'
import Breadcrumbs from '../breadcrumb'
import Loading from '../loading'
import SideNavToggler from '../nav/sidenav-toggler'
import NotFound from '../notFound'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { toast } from '../ui/use-toast'
import ApiResult from './api-result'
import InputTabs from './input-tabs'
export type JSONErrorType = {
  isError: boolean
  error: string
}

export type ResponseStatus = {
  status?: number
  statusText: string
  time: string
}

export default function Api() {
  const { api, getApi, updateApi, collections, env, getEnv, updateEnv } =
    useApiStore()
  const params = useParams()
  const { isOpen } = useSidePanelToggleStore()
  const [urlWidth, setUrlWidth] = useState<number>()
  const formDivRef = useRef<HTMLFormElement>(null)
  const navigate = useNavigate()
  const [result, setResult] = useState<any>()
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false)
  const breadCrumbDivRef = useRef<HTMLDivElement>(null)
  const urlDivRef = useRef<HTMLDivElement>(null)
  const updateButtonRef = useRef<HTMLButtonElement>(null)
  const [sizes, setSizes] = useState<number[]>([
    (window.innerHeight - 320) / 3,
    (window.innerHeight - 320) / 3,
  ])
  const [splitPanelHeight, setSplitPanelHeight] = useState<number>()
  const [headers, setHeaders] = useState<{ [key: string]: any }>()
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    status: 0,
    statusText: '',
    time: '',
  })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<ApiType>({
    mode: 'onChange',
    resolver: zodResolver(ApiSchema),
  })
  const [searchParams] = useSearchParams()
  const customParams = form.watch('params')
  const pathVariables = form.watch('pathVariables')
  const interactiveQuery = form.watch('interactiveQuery')
  let url = form.watch('url')
  const hasActiveCustomParams = !!customParams?.filter(
    (item) => item.isActive && item.key !== '',
  ).length
  url = generateURLFromParams(url, pathVariables!)
  url =
    !!filterEmptyParams(customParams!)?.length &&
    hasActiveCustomParams &&
    form.watch('activeQuery') === 'query-params'
      ? url +
        (hasActiveCustomParams ? '?' : '') +
        getQueryString(arrayToObjectConversion(customParams!), env)
      : typeof interactiveQuery === 'object' &&
        Object.keys(interactiveQuery)?.length &&
        form.watch('activeQuery') === 'interactive-query'
      ? url + '?' + getQueryString(interactiveQuery)
      : url
  const apiId = params.apiId as string
  const folderId = params.folderId as string

  useEffect(() => {
    if (apiId && folderId) {
      getApi(apiId!)
      getEnv(folderId!)
    } else {
      navigate('/')
    }
    setResponseStatus({ status: 0, statusText: '', time: '' })
    setResult(null)
    setHeaders({})
  }, [apiId, folderId, getApi, navigate, getEnv])

  useEffect(() => {
    if (apiId && folderId && !api) {
      navigate('/')
    }
  }, [api, apiId, folderId, navigate])

  useEffect(() => {
    if (api.id === apiId) {
      try {
        setResult(api.response ? JSON.parse(api.response!) : null)
      } catch (error) {
        setResult(api.response ? api.response! : null)
      }
      setResponseStatus(
        api.responseStatus
          ? JSON.parse(api.responseStatus!)
          : {
              status: 0,
              statusText: '',
              time: '',
            },
      )
    } else {
      setResult(null)
      setResponseStatus({
        status: 0,
        statusText: '',
        time: '',
      })
    }
  }, [api, apiId])

  useLayoutEffect(() => {
    setTimeout(() => {
      if (
        breadCrumbDivRef?.current &&
        urlDivRef?.current &&
        formDivRef?.current
      ) {
        if (searchParams.get('view') === 'horizontal') {
          setSplitPanelHeight(window.innerHeight)
          setSizes([
            formDivRef.current.clientWidth / 3,
            formDivRef.current.clientWidth / 3,
          ])
        } else {
          setSplitPanelHeight(
            window.innerHeight -
              (breadCrumbDivRef.current?.clientHeight +
                urlDivRef.current?.clientHeight),
          )
          setSizes([
            200,
            (window.innerHeight -
              (breadCrumbDivRef.current?.clientHeight +
                urlDivRef.current?.clientHeight)) /
              2,
          ])
        }
      }
    }, 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    setTimeout(() => {
      if (urlDivRef?.current) {
        setUrlWidth(urlDivRef?.current?.offsetWidth - 180)
      }
    }, 100)

    window.addEventListener('resize', () => {
      if (urlDivRef?.current) {
        setUrlWidth(urlDivRef?.current?.offsetWidth - 180)
      }
    })
  }, [isOpen])

  useEffect(() => {
    const setAllParams = () => {
      form.setValue('id', api?.id ?? '')
      form.setValue('name', api?.name ?? '')
      form.setValue('method', api?.method ?? 'GET')
      form.setValue(
        'url',
        api?.url?.includes('?') ? api?.url?.split('?')[0] : api?.url ?? '',
      )
      form.setValue(
        'params',
        api?.params?.length
          ? api?.params
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
      form.setValue(
        'headers',
        api?.headers?.length
          ? api?.headers
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
      form.setValue(
        'body',
        api?.body?.length
          ? api?.body
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
      form.setValue('jsonBody', api?.jsonBody)
      form.setValue(
        'dynamicVariables',
        api?.dynamicVariables?.length
          ? api?.dynamicVariables
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
      form.setValue(
        'activeBody',
        typeof api.jsonBody !== 'undefined' && Object.keys(api?.jsonBody).length
          ? 'json'
          : 'x-form-urlencoded',
      )
      form.setValue(
        'pathVariables',
        api?.pathVariables?.length
          ? api?.pathVariables
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
      form.setValue('interactiveQuery', api?.interactiveQuery ?? {})
      form.setValue(
        'activeQuery',
        searchParams.get('activeQuery')
          ? (searchParams.get('activeQuery')! as
              | 'query-params'
              | 'interactive-query')
          : api?.params?.filter((item) => item.isActive)?.length
          ? 'query-params'
          : typeof api?.interactiveQuery === 'object' &&
            Object.keys(api?.interactiveQuery).length
          ? 'interactive-query'
          : 'query-params',
      )
    }

    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        if (form.formState.isDirty) {
          updateButtonRef.current?.click()
          form.reset()
          getApi(api?.id)
        }
      }
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        form.reset()
        setAllParams()
      }
    }

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleEscapeKeyPress)
    setAllParams()
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress)
    }
  }, [form, api, getApi, searchParams])

  // this is making the API call
  const onSubmit: SubmitHandler<ApiType> = async (submitData) => {
    let responseData = null
    let responseStatusData = {
      status: 0,
      statusText: '',
      time: '',
    }
    // track the time to get the duration of api call
    const startTime = Date.now()
    try {
      setIsLoading(true)

      // get the params in querystring from an array
      const params =
        form.watch('activeQuery') === 'query-params'
          ? getQueryString(
              arrayToObjectConversion(form.getValues('params')!),
              env,
            )
          : typeof form.getValues('interactiveQuery') === 'object'
          ? getQueryString(form.getValues('interactiveQuery'))
          : ''

      // This will update the url with given path variable  and will generate if user input something
      let url = submitData.pathVariables?.find((item) => item.key !== '')
        ? updateUrlWithPathVariables(
            generateURLFromParams(submitData.url, submitData.pathVariables!),
            submitData.pathVariables!,
          )
        : submitData.url
      url = url + (params ? '?' + params : '')

      // This will replace the {{dynamic_variable}} withe the variable's value
      url = containsDynamicVariable(url) ? replaceVariables(url, env) : url

      // This will check if the {{dynamic_variable}} exists on body payload. If exists then replace with the value
      const requestBody = checkAndReplaceWithDynamicVariable(
        arrayToObjectConversion(submitData.body!),
        env,
      )

      // This will check if the {{dynamic_variable}} exists on header payload. If exists then replace with the value
      const headers = checkAndReplaceWithDynamicVariable(
        arrayToObjectConversion(submitData.headers!),
        env,
      )

      // This is for the media upload
      const formData = new FormData()
      const files = submitData.body?.filter((item) => item?.type === 'file')
      if (files?.length) {
        files.map((file) => {
          Array.from(file.value).map((item: Blob | any) => {
            formData.append(file.key, item)
          })
        })
      }
      Object.keys(requestBody).map((item) => {
        if (!files?.find((file) => file.key === item)) {
          formData.append(item, requestBody[item])
        }
      })

      const activeBody = form.getValues('activeBody')
      // this is axios call
      const response = await fetcher({
        method: api.method,
        url:
          !url.includes('http') &&
          (url.includes('localhost') || url.includes('127.0.0.1'))
            ? 'http://' + url
            : url,
        submitDataBody: submitData.body,
        isUpload: files?.length ? true : false,
        headers,
        requestBody:
          activeBody === 'json' ? form.getValues('jsonBody') : requestBody,
      })
      const endTime = Date.now()

      // This will get the response time duration
      const responseTime = endTime - startTime
      let resultText: string = ''

      // setting up headers
      try {
        await platform()
        setHeaders({
          ...response?.headers,
          'set-cookie':
            response && (response as any).rawHeaders['set-cookie']
              ? (response as any).rawHeaders['set-cookie']
              : '',
        })
        const arrayBuffer = new Uint8Array(response && response.data).buffer
        resultText = new TextDecoder('utf-8').decode(arrayBuffer)
        try {
          responseData = JSON.parse(resultText)
          setResult(responseData)
        } catch (error) {
          responseData = resultText
          setResult(responseData)
        }
      } catch (error) {
        setHeaders({
          ...response?.headers,
          'set-cookie':
            response && response.headers['set-cookie']
              ? response.headers['set-cookie']
              : '',
        })
        responseData = response && response.data
        setResult(responseData)
      }
      responseStatusData = {
        status: response && response?.status,
        statusText: 'ok',
        time: (responseTime as number) + 'ms',
      }
      setResponseStatus(responseStatusData)

      // If there is any requirement to set the value of a {{dynamic_variable}} with the response, this logic will do that and update that {{dynamic_variable}}
      if (api.dynamicVariables?.length) {
        const updatedEnv = updateEnvWithDynamicVariableValue(
          submitData.dynamicVariables!,
          env,
          JSON.parse(resultText),
        )
        updateEnv(collections, folderId, updatedEnv)
      }

      setIsLoading(false)
    } catch (error: any) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      if (error?.response && error?.response?.data) {
        responseStatusData = {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          time: (responseTime as number) + 'ms',
        }
        setResponseStatus(responseStatusData)
        responseData = error?.response ? error?.response?.data : error?.message
        setResult(responseData)
      } else {
        toast({
          variant: 'error',
          title:
            typeof error !== 'string'
              ? error?.response?.data
                ? error?.response?.data
                : error?.message
              : error,
        })
        setResult(null)
        responseData = null
      }
      setIsLoading(false)
    }

    // auto saving the response
    const dataWithResponse = {
      ...api,
      response: JSON.stringify(responseData),
      responseStatus: JSON.stringify(responseStatusData),
    }
    updateApi(dataWithResponse, dataWithResponse.id)
  }

  const callApi = async () => {
    buttonRef.current?.click()
  }

  const saveUpdate = () => {
    const data: ApiType = {} as ApiType
    data.id = api.id
    data.params = filterEmptyParams(form.getValues('params')!)
    data.headers = filterEmptyParams(form.getValues('headers')!)
    data.dynamicVariables = filterEmptyParams(
      form.getValues('dynamicVariables')!,
    )
    data.body = filterEmptyParams(form.getValues('body')!)
    data.pathVariables = filterEmptyParams(form.getValues('pathVariables')!)
    data.jsonBody = form.getValues('jsonBody')
    data.interactiveQuery = form.getValues('interactiveQuery')
    data.response = result
    data.responseStatus = JSON.stringify(responseStatus)
    updateApi(data, api.id)
    toast({
      variant: 'success',
      title: 'Api is updated',
    })
    form.reset()
    getApi(api?.id)
  }

  const copyUrl = () => {
    setIsUrlCopied(true)
    const params =
      isEmpty(form.getValues('params')!) &&
      form.getValues('activeQuery') === 'query-params'
        ? getQueryString(
            arrayToObjectConversion(form.getValues('params')!),
            env,
          )
        : typeof interactiveQuery === 'object' &&
          Object.keys(interactiveQuery)?.length
        ? getQueryString(form.getValues('interactiveQuery'))
        : ''
    let url = form.getValues('pathVariables')?.find((item) => item.key !== '')
      ? updateUrlWithPathVariables(
          generateURLFromParams(
            form.getValues('url'),
            form.getValues('pathVariables')!,
          ),
          form.getValues('pathVariables')!,
        )
      : form.getValues('url')
    url = url + (params ? '?' + params : '')

    // This will replace the {{dynamic_variable}} withe the variable's value
    url = containsDynamicVariable(url) ? replaceVariables(url, env) : url
    url =
      !url.includes('http') &&
      (url.includes('localhost') || url.includes('127.0.0.1'))
        ? 'http://' + url
        : url
    copy(url)
    toast({
      variant: 'success',
      title: 'Url is copied',
    })
    setTimeout(() => {
      setIsUrlCopied(false)
    }, 2000)
  }

  if (
    apiId === 'undefined' ||
    apiId === 'null' ||
    folderId === 'undefined' ||
    folderId === 'null' ||
    !collections?.length
  ) {
    return <NotFound />
  }
  if (apiId && folderId && !api.id) {
    return <Loading />
  }

  return (
    <form
      ref={formDivRef}
      onSubmit={form.handleSubmit(onSubmit)}
      className="overflow-hidden"
      style={{ height: window.innerHeight }}
    >
      <div
        ref={breadCrumbDivRef}
        className="flex items-center p-5"
      >
        <SideNavToggler />
        <Breadcrumbs
          breadcrumbs={getBreadcrumbsForNthChildren(collections, folderId!)}
        />
        <ChevronsRight
          size={13}
          className="mx-2"
        />
        {api.name}
        {form.formState.isDirty && (
          <Button
            ref={updateButtonRef}
            onClick={() => saveUpdate()}
            type="button"
            size="xs"
            className="py-.5 px-1 ml-2 text-xs"
          >
            Save
          </Button>
        )}
      </div>
      <div
        ref={urlDivRef}
        className="mx-auto relative h-10 flex w-[calc(100%-40px)] items-center justify-between rounded overflow-hidden border p-0"
        onDoubleClick={() => navigate(`/api/${folderId}/${apiId}/update`)}
      >
        <div className="flex items-center">
          <span
            className={
              (api.method === 'GET'
                ? 'text-green-500'
                : api.method === 'POST'
                ? 'text-yellow-500'
                : api.method === 'PUT'
                ? 'text-blue-500'
                : api.method === 'PATCH'
                ? 'text-purple-500'
                : api.method === 'DELETE'
                ? 'text-destructive'
                : 'text-foreground') + ' font-bold px-2 border-r'
            }
          >
            {api.method}
          </span>
          <div
            style={{
              width: urlWidth,
              maxWidth: '100%',
            }}
            className="overflow-hidden truncate px-2"
          >
            {containsDynamicVariable(api.url) ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-cyan-500">{`{{${extractVariable(
                    url,
                  )}}}`}</span>
                </TooltipTrigger>
                <TooltipContent className="flex items-center text-base">
                  {replaceVariables(`{{${extractVariable(url)}}}`, env)}
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-2 flex h-4 w-4 justify-self-end p-0"
                    size="xs"
                    onClick={() => {
                      copy(replaceVariables(`{{${extractVariable(url)}}}`, env))
                      toast({
                        variant: 'success',
                        title: 'Env value is copied!',
                      })
                    }}
                  >
                    <Copy size={16} />
                  </Button>
                </TooltipContent>
              </Tooltip>
            ) : (
              url
            )}
            {url?.split('}}')[1]}
          </div>
        </div>
        <div className="flex items-center justify-end absolute right-0 h-auto bg-background pl-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="mr-2 flex h-8 w-8 justify-self-end p-0"
                size="sm"
                onClick={() => copyUrl()}
              >
                {isUrlCopied ? (
                  <Check
                    className="animate__animated animate__fadeIn"
                    size={18}
                  />
                ) : (
                  <Copy
                    className="animate__animated animate__fadeIn"
                    size={18}
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy url</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="mr-2 flex h-8 w-8 justify-self-end p-0"
                size="sm"
                onClick={() => navigate(`/api/${folderId}/${apiId}/update`)}
              >
                <Settings
                  className="animate__animated animate__fadeIn"
                  size={18}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => callApi()}
                className="p-1 rounded-l-none"
                size="icon"
              >
                <i className="bi bi-plugin text-2xl font-bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send request</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <SplitPane
        sashRender={() => <></>}
        split={
          (searchParams.get('view') === 'horizontal'
            ? 'vertical'
            : searchParams.get('view') === 'vertical'
            ? 'horizontal'
            : 'horizontal') as 'vertical' | 'horizontal'
        }
        sizes={sizes}
        onChange={(sizes) => setSizes(sizes)}
      >
        <Pane
          minSize={
            searchParams.get('view') === 'horizontal'
              ? formDivRef?.current?.clientWidth &&
                formDivRef?.current?.clientWidth / 3
              : 5
          }
          maxSize="100%"
        >
          <InputTabs
            className="px-5 pt-2"
            height={
              searchParams.get('view') === 'horizontal'
                ? window.innerHeight
                : sizes[0]
            }
            form={form}
            api={api}
          />
        </Pane>

        <Pane
          minSize={
            searchParams.get('view') === 'horizontal'
              ? formDivRef?.current?.clientWidth &&
                formDivRef?.current?.clientWidth / 2.9
              : 160
          }
          maxSize="100%"
        >
          <ApiResult
            height={
              searchParams.get('view') === 'horizontal'
                ? window.innerHeight
                : splitPanelHeight!
            }
            isLoading={isLoading}
            result={result}
            headers={headers}
            responseStatus={responseStatus}
          />
        </Pane>
      </SplitPane>
    </form>
  )
}
