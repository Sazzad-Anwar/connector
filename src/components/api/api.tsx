/* eslint-disable @typescript-eslint/no-explicit-any */
import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import copy from 'copy-to-clipboard'
import { ChevronsRight, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import {
  arrayToObjectConversion,
  checkAndReplaceWithDynamicVariable,
  containsDynamicVariable,
  extractVariable,
  generateURLFromParams,
  getBreadcrumbsForNthChildren,
  getQueryString,
  isEmpty,
  replaceVariables,
  updateEnvWithDynamicVariableValue,
  updateUrlWithPathVariables,
} from '@/lib/utils'
import { ApiSchema, ApiType } from '@/types/api'

import { useNavigate, useParams } from 'react-router-dom'
import SplitPane, { Pane } from 'split-pane-react'
import { config } from '../../config/confit'
import Breadcrumbs from '../breadcrumb'
import Loading from '../loading'
import SideNavToggler from '../nav/sidenav-toggler'
import NotFound from '../notFound'
import { Button } from '../ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { toast } from '../ui/use-toast'
import ApiResult from './api-result'
import InputTabs from './input-tabs'

export type JSONErrorType = {
  isError: boolean
  error: string
}

export type ResponseStatus = {
  status: number
  statusText: string
  time: string
}

export default function Api() {
  const { api, getApi, updateApi, collections, env, getEnv, updateEnv } =
    useApiStore()
  const params = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<any>()
  const [splitPanelHeight, setSplitPanelHeight] = useState<number>()
  const [heightOfBreadcrumbUrl, setHeightOfBreadcrumbUrl] = useState<number>()
  const breadCrumbDivRef = useRef<HTMLDivElement>(null)
  const urlDivRef = useRef<HTMLDivElement>(null)
  const updateButtonRef = useRef<HTMLButtonElement>(null)
  const [sizes, setSizes] = useState([200, 300])
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
  const customParams = form.watch('params')
  const pathVariables = form.watch('pathVariables')
  let url = form.watch('url')
  url = generateURLFromParams(url, pathVariables!)

  url =
    !isEmpty(customParams!) && !url?.includes('?')
      ? url + '?' + getQueryString(arrayToObjectConversion(customParams!), env)
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
  }, [apiId, folderId, getApi, navigate, getEnv])

  useEffect(() => {
    if (api.id === apiId) {
      setResult(api.response ? JSON.parse(api.response!) : null)
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

  useEffect(() => {
    setTimeout(() => {
      if (breadCrumbDivRef?.current && urlDivRef?.current) {
        setSplitPanelHeight(
          window.innerHeight -
            (breadCrumbDivRef.current?.clientHeight +
              urlDivRef.current?.clientHeight),
        )
        setSizes([
          200,
          window.innerHeight -
            (breadCrumbDivRef.current?.clientHeight +
              urlDivRef.current?.clientHeight) -
            600,
        ])
        setHeightOfBreadcrumbUrl(
          breadCrumbDivRef.current?.clientHeight +
            urlDivRef.current?.clientHeight,
        )
      }
    }, 100)
  }, [])

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
      form.setValue('activeBody', api?.jsonBody ? 'json' : 'x-form-urlencoded')
      form.setValue(
        'pathVariables',
        api?.pathVariables?.length
          ? api?.pathVariables
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
    }

    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        updateButtonRef.current?.click()
        form.reset()
        getApi(api?.id)
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
  }, [form, api, getApi])

  // this is making the API call
  const onSubmit: SubmitHandler<ApiType> = async (submitData) => {
    // track the time to get the duration of api call
    const startTime = Date.now()
    try {
      setIsLoading(true)

      // get the params in querystring from an array
      const params = isEmpty(submitData.params!)
        ? getQueryString(arrayToObjectConversion(api.params!), env)
        : getQueryString(arrayToObjectConversion(submitData.params!), env)

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
      const requestPayload =
        activeBody === 'json'
          ? form.getValues('jsonBody')
          : files?.length
          ? formData
          : requestBody

      // this is axios call
      const response = await axios({
        method: api.method,
        url: config.CORS_BYPASS_URL + url,
        data: requestPayload,
        headers,
      })
      const endTime = Date.now()

      // This will get the response time duration
      const responseTime = endTime - startTime
      setResult(response.data)
      setResponseStatus({
        status: response?.status,
        statusText: response?.statusText,
        time: (responseTime as number) + 'ms',
      })
      // auto saving the response
      const dataWithResponse = {
        ...api,
        response: JSON.stringify(response.data),
        responseStatus: JSON.stringify({
          status: response?.status,
          statusText: response?.statusText,
          time: (responseTime as number) + 'ms',
        }),
      }

      updateApi(dataWithResponse, api.id)

      // If there is any requirement to set the value of a {{dynamic_variable}} with the response, this logic will do that and update that {{dynamic_variable}}
      if (api.dynamicVariables?.length) {
        const updatedEnv = updateEnvWithDynamicVariableValue(
          submitData.dynamicVariables!,
          env,
          response.data,
        )
        updateEnv(collections, folderId, updatedEnv)
      }

      setIsLoading(false)
    } catch (error: any) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      setResponseStatus({
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        time: (responseTime as number) + 'ms',
      })

      if (error?.response && error?.response?.data) {
        setResult(error?.response ? error?.response?.data : error?.message)
      } else {
        toast({
          variant: 'error',
          title: error?.response ? error?.response?.data : error?.message,
        })
      }
      setIsLoading(false)
    }
  }

  const callApi = async () => {
    buttonRef.current?.click()
  }

  const saveUpdate = () => {
    const data: ApiType = {} as ApiType
    data.id = api.id
    data.params = isEmpty(form.getValues('params')!)
      ? []
      : form.getValues('params')
    data.headers = isEmpty(form.getValues('headers')!)
      ? []
      : form.getValues('headers')
    data.dynamicVariables = isEmpty(form.getValues('dynamicVariables')!)
      ? []
      : form.getValues('dynamicVariables')
    data.body = isEmpty(form.getValues('body')!) ? [] : form.getValues('body')
    data.pathVariables = isEmpty(form.getValues('pathVariables')!)
      ? []
      : form.getValues('pathVariables')
    data.jsonBody = form.getValues('jsonBody')
    updateApi(data, api.id)
    toast({
      variant: 'success',
      title: 'Api is updated',
    })
    form.reset()
    getApi(api?.id)
  }

  const copyUrl = () => {
    const params = isEmpty(form.getValues('params')!)
      ? getQueryString(arrayToObjectConversion(api.params!), env)
      : getQueryString(arrayToObjectConversion(form.getValues('params')!), env)
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

    copy(url)
    toast({
      variant: 'success',
      title: 'Url is copied',
    })
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
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="overflow-hidden"
        style={{ height: window.innerHeight }}
      >
        <SplitPane
          sashRender={() => <></>}
          split="horizontal"
          sizes={sizes}
          onChange={(sizes) => setSizes(sizes)}
        >
          <Pane
            minSize={120}
            maxSize="100%"
            style={{
              top: heightOfBreadcrumbUrl,
            }}
          >
            <div
              ref={breadCrumbDivRef}
              className="flex items-center p-5"
            >
              <SideNavToggler />
              <Breadcrumbs
                breadcrumbs={getBreadcrumbsForNthChildren(
                  collections,
                  folderId!,
                )}
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
              className="mx-auto flex w-[calc(100%-40px)] items-center justify-between rounded border p-0"
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
                <div className=" max-w-[12rem] overflow-hidden truncate px-2 md:max-w-[34rem] lg:max-w-[45rem] xl:max-w-4xl 2xl:max-w-7xl">
                  {containsDynamicVariable(api.url) ? (
                    <TooltipProvider>
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
                              copy(
                                replaceVariables(
                                  `{{${extractVariable(url)}}}`,
                                  env,
                                ),
                              )
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
                    </TooltipProvider>
                  ) : (
                    url
                  )}
                  {url.split('}}')[1]}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-2 flex h-8 w-8 justify-self-end p-0"
                  size="sm"
                  onClick={() => copyUrl()}
                >
                  <Copy size={18} />
                </Button>
                <Button
                  onClick={() => callApi()}
                  className="text-white p-1 rounded-l-none"
                  size="icon"
                >
                  <i className="bi bi-plugin text-2xl" />
                </Button>
              </div>
            </div>
            <InputTabs
              className="px-5 pt-5"
              height={sizes[0]}
              form={form}
              api={api}
            />
          </Pane>

          <Pane
            minSize={50}
            maxSize="100%"
          >
            <ApiResult
              height={splitPanelHeight!}
              isLoading={isLoading}
              result={result}
              responseStatus={responseStatus}
            />
          </Pane>
        </SplitPane>
      </form>
    </>
  )
}
