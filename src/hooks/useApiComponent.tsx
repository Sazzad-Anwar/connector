import { zodResolver } from '@hookform/resolvers/zod'
import { platform } from '@tauri-apps/plugin-os'
import copy from 'copy-to-clipboard'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { ResponseStatus } from '../components/api/api'
import { toast } from '../components/ui/use-toast'
import fetcher from '../lib/fetcher'
import {
  arrayToObjectConversion,
  checkAndReplaceWithDynamicVariable,
  containsDynamicVariable,
  extractVariable,
  filterEmptyParams,
  getQueryString,
  replaceVariables,
  updateEnvWithDynamicVariableValue,
  updateUrlWithPathVariables,
} from '../lib/utils'
import useResultRenderViewStore from '../store/resultRenderView'
import useSidePanelToggleStore from '../store/sidePanelToggle'
import useApiStore, { isLocalStorageAvailable } from '../store/store'
import useTabRenderStore from '../store/tabView'
import { ApiSchema, ApiType, ParamsType } from '../types/api'

export default function useApiComponent() {
  const { api, getApi, updateApi, collections, env, getEnv, updateEnv } =
    useApiStore()
  const params = useParams()
  const { state } = useLocation()
  const { updateTab } = useTabRenderStore()
  const { resultRenderView } = useResultRenderViewStore()
  const { isOpen } = useSidePanelToggleStore()
  const [urlWidth, setUrlWidth] = useState<number>()
  const formDivRef = useRef<HTMLFormElement>(null)
  const navigate = useNavigate()
  const [result, setResult] = useState<any>()
  const [isUrlEditing, setIsUrlEditing] = useState(state?.isUrlEditing ?? false)
  const [isApiNameEditing, setIsApiNameEditing] = useState(
    state?.isApiNameEditing ?? false,
  )
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false)
  const breadCrumbDivRef = useRef<HTMLDivElement>(null)
  const urlDivRef = useRef<HTMLDivElement>(null)
  const [sizes, setSizes] = useState<number[]>([
    (window.innerHeight - 320) / 2,
    (window.innerHeight - 320) / 2,
  ])
  const [headers, setHeaders] = useState<{ [key: string]: any }>()
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    status: 0,
    statusText: '',
    time: '',
  })
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
    (item: ParamsType) => item.isActive && item.key !== '',
  ).length
  url =
    !!filterEmptyParams(customParams!)?.length &&
    hasActiveCustomParams &&
    form.watch('activeQuery') === 'query-params'
      ? url + '?' + getQueryString(arrayToObjectConversion(customParams!), env)
      : typeof interactiveQuery === 'object' &&
        Object.keys(interactiveQuery)?.length
      ? url + '?' + getQueryString(interactiveQuery)
      : url
  const apiId = params.apiId as string
  const folderId = params.folderId as string

  useEffect(() => {
    state?.isUrlEditing ? setIsUrlEditing(true) : null
    state?.isApiNameEditing ? setIsApiNameEditing(true) : null
  }, [state])

  useEffect(() => {
    if (apiId && folderId) {
      getApi(apiId)
      getEnv(folderId)
    } else {
      navigate('/')
    }
    setResponseStatus({ status: 0, statusText: '', time: '' })
    setResult(null)
    setHeaders({})
  }, [apiId, folderId, getApi, navigate, getEnv])

  useEffect(() => {
    if (isLocalStorageAvailable()) {
      localStorage.setItem('resultRenderView', resultRenderView)
    }
  }, [])

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
    window?.addEventListener('resize', () => {
      resizeWindow()
    })
    const resizeWindow = () => {
      setTimeout(() => {
        if (
          breadCrumbDivRef?.current &&
          urlDivRef?.current &&
          formDivRef?.current
        ) {
          if (resultRenderView === 'vertical') {
            setSizes([
              formDivRef?.current?.clientWidth &&
                formDivRef?.current?.clientWidth / 3,
              formDivRef?.current?.clientWidth &&
                formDivRef?.current?.clientWidth / 2.8,
            ])
          } else {
            setSizes([
              (window.innerHeight -
                (breadCrumbDivRef.current?.clientHeight +
                  urlDivRef.current?.clientHeight)) /
                2,
              (window.innerHeight -
                (breadCrumbDivRef.current?.clientHeight +
                  urlDivRef.current?.clientHeight)) /
                1.7,
            ])
          }
        }
      }, 100)
    }
    resizeWindow()
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
          : api?.params?.filter((item: ParamsType) => item.isActive)?.length
          ? 'query-params'
          : typeof api?.interactiveQuery === 'object' &&
            Object.keys(api?.interactiveQuery).length
          ? 'interactive-query'
          : 'query-params',
      )
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey && event.key === 's') ||
        (event.metaKey && event.key === 's')
      ) {
        event.preventDefault()
        if (form.formState.isDirty) {
          saveUpdate()
          getApi(api?.id)
          form.reset(api)
        }
      }
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        // getApi(api?.id)
        form.reset(api)
        setIsUrlEditing(false)
        setIsApiNameEditing(false)
      }
    }

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleKeyPress)
    // document.addEventListener('keyup', handleKeyPress)
    setAllParams()
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      // document.addEventListener('keyup', handleKeyPress)
    }
  }, [form, api, searchParams])

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
      const files = submitData.body?.filter(
        (item: ParamsType) => item?.type === 'file',
      )
      if (files?.length) {
        files.map((file: ParamsType) => {
          Array.from(file.value).map((item: Blob | any) => {
            formData.append(file.key, item)
          })
        })
      }
      Object.keys(requestBody).map((item) => {
        if (!files?.find((file: ParamsType) => file.key === item)) {
          formData.append(item, requestBody[item])
        }
      })

      const activeBody = form.getValues('activeBody')
      // this is axios call
      url = containsDynamicVariable(url)
        ? replaceVariables(updateUrlWithPathVariables(url, pathVariables!), env)
        : url.split('://')[1].includes('/:')
        ? updateUrlWithPathVariables(url, pathVariables!)
        : url
      const response = await fetcher({
        method: api.method,
        url,
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
          responseData,
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
          title: 'Error',
          description:
            typeof error !== 'string'
              ? error?.response?.data
                ? error?.response?.data
                : error?.message === 'Network Error'
                ? `Unable to reach ${replaceVariables(
                    `{{${extractVariable(url)}}}`,
                    env,
                  )}`
                : error.message
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

  const saveUpdate = useCallback(() => {
    const data: ApiType = {} as ApiType
    if (
      params?.apiId &&
      form.getValues('name') &&
      form.getValues('url') &&
      form.getValues('method')
    ) {
      data.id = params?.apiId!
      data.name = form.getValues('name')!
      data.url = form.getValues('url')!
      data.method = form.getValues('method')!
      data.params = filterEmptyParams(form.getValues('params')!)
      data.headers = filterEmptyParams(form.getValues('headers')!)
      data.dynamicVariables = filterEmptyParams(
        form.getValues('dynamicVariables')!,
      )
      data.body = filterEmptyParams(form.getValues('body')!)
      data.pathVariables = filterEmptyParams(form.getValues('pathVariables')!)
      data.jsonBody = form.getValues('jsonBody')
      data.interactiveQuery = form.getValues('interactiveQuery')
      updateApi(data, params.apiId)
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Api is updated successfully',
      })
      setIsUrlEditing(false)
      setIsApiNameEditing(false)
      form.reset()
      updateTab({
        id: params.apiId,
        name: data.name,
        folderId: folderId,
      })
      navigate(`/api/${folderId}/${params.apiId}`)
      getApi(api?.id)
    }
  }, [form, api])

  const copyUrl = () => {
    setIsUrlCopied(true)
    url = containsDynamicVariable(url)
      ? replaceVariables(updateUrlWithPathVariables(url, pathVariables!), env)
      : url.split('://')[1].includes('/:')
      ? updateUrlWithPathVariables(url, pathVariables!)
      : url
    copy(url)
    toast({
      variant: 'success',
      title: 'Success',
      description: 'Url is copied to clipboard',
    })
    setTimeout(() => {
      setIsUrlCopied(false)
    }, 2000)
  }

  return {
    params,
    urlWidth,
    setUrlWidth,
    formDivRef,
    result,
    setResult,
    isUrlCopied,
    setIsUrlCopied,
    breadCrumbDivRef,
    urlDivRef,
    sizes,
    setSizes,
    headers,
    setHeaders,
    responseStatus,
    setResponseStatus,
    isLoading,
    setIsLoading,
    form,
    searchParams,
    customParams,
    pathVariables,
    interactiveQuery,
    updateApi,
    getApi,
    updateEnv,
    getEnv,
    copyUrl,
    onSubmit,
    saveUpdate,
    apiId,
    folderId,
    url,
    api,
    collections,
    env,
    isUrlEditing,
    setIsUrlEditing,
    isApiNameEditing,
    setIsApiNameEditing,
  }
}
