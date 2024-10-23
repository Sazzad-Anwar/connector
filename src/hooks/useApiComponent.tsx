import { zodResolver } from '@hookform/resolvers/zod'
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
import { config } from '../config/config'
import fetcher from '../lib/fetcher'
import {
  arrayToObjectConversion,
  checkAndReplaceWithDynamicVariable,
  containsDynamicVariable,
  filterEmptyParams,
  generateCurlFromJson,
  getQueryString,
  isCurlCall,
  parseCookie,
  parseCurlToJson,
  parseURLParameters,
  replaceVariables,
  updateEnvWithDynamicVariableValue,
  updateUrlWithPathVariables,
} from '../lib/utils'
import useResultRenderViewStore from '../store/resultRenderView'
import useSidePanelToggleStore from '../store/sidePanelToggle'
import useApiStore, { isLocalStorageAvailable } from '../store/store'
import useTabRenderStore from '../store/tabView'
import { ApiSchema, ApiType, CookieType, ParamsType } from '../types/api'

export default function useApiComponent() {
  const { api, getApi, updateApi, collections, env, getEnv, updateEnv } =
    useApiStore()
  const params = useParams()
  const [cookies, setCookies] = useState<CookieType[]>([])
  const [isProxyAdded, setIsProxyAdded] = useState<boolean>(false)
  const { state } = useLocation()
  const { updateTab } = useTabRenderStore()
  const { resultRenderView } = useResultRenderViewStore()
  const { isOpen } = useSidePanelToggleStore()
  const [curl, setCurl] = useState<string>('')
  const [urlWidth, setUrlWidth] = useState<number>()
  const formDivRef = useRef<HTMLDivElement>(null)
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
    resultRenderView === 'vertical'
      ? formDivRef?.current?.clientWidth
        ? formDivRef.current.clientWidth / 3
        : (window.innerHeight - 320) / 2
      : 5,
    resultRenderView === 'vertical'
      ? formDivRef?.current?.clientWidth
        ? formDivRef.current.clientWidth / 2.9
        : (window.innerHeight - 320) / 2
      : 200,
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
        setHeaders(api.responseHeaders || {})
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
      form.setValue('responseHeaders', api?.responseHeaders)
      form.setValue(
        'url',
        api?.url?.includes('?') ? api?.url?.split('?')[0] : api?.url ?? '',
      )
      form.setValue(
        'params',
        api?.params?.length
          ? filterEmptyParams(api?.params)
          : [{ id: uuid(), key: '', value: '' }],
      )
      form.setValue(
        'headers',
        api?.headers?.length
          ? filterEmptyParams(api?.headers)
          : [{ id: uuid(), key: '', value: '' }],
      )
      form.setValue(
        'body',
        api?.body?.length
          ? filterEmptyParams(api?.body)
          : [{ id: uuid(), key: '', value: '' }],
      )
      form.setValue(
        'formData',
        api?.formData?.length
          ? filterEmptyParams(api?.formData)
          : [{ id: uuid(), key: '', value: '' }],
      )
      form.setValue('jsonBody', api?.jsonBody)
      form.setValue(
        'dynamicVariables',
        api?.dynamicVariables?.length
          ? api?.dynamicVariables
          : [{ id: uuid(), key: '', value: '' }],
      )
      form.setValue(
        'activeBody',
        typeof api.jsonBody !== 'undefined' && Object.keys(api?.jsonBody).length
          ? 'json'
          : api.formData?.length
          ? 'form-data'
          : 'x-form-urlencoded',
      )
      form.setValue(
        'pathVariables',
        api?.pathVariables?.length
          ? api?.pathVariables
          : [{ id: uuid(), key: '', value: '' }],
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
    setCurl(replaceVariables(generateCurlFromJson(api), env))

    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey && event.key === 's') ||
        (event.metaKey && event.key === 's')
      ) {
        event.preventDefault()
        saveUpdate()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
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
    setCookies([])
    // track the time to get the duration of api call
    const startTime = Date.now()
    try {
      setIsLoading(true)

      // This will check if the {{dynamic_variable}} exists on body payload. If exists then replace with the value
      const requestBody = checkAndReplaceWithDynamicVariable(
        submitData.activeBody === 'x-form-urlencoded'
          ? arrayToObjectConversion(submitData.body!)
          : arrayToObjectConversion(submitData.formData!),
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
        : url.split('://')[1]?.includes('/:')
        ? updateUrlWithPathVariables(url, pathVariables!)
        : url
      url = !url.includes('http') ? `http://${url}` : url
      const response = await fetcher({
        method: api.method,
        url: isProxyAdded ? `${config.CORS_BYPASS_URL}?${url}` : url,
        headers,
        requestBody:
          activeBody === 'json'
            ? form.getValues('jsonBody')
            : activeBody === 'form-data'
            ? form.getValues('formData')
            : requestBody,
        contentType:
          activeBody === 'json'
            ? 'application/json'
            : activeBody === 'form-data'
            ? 'multipart/form-data'
            : 'application/x-www-form-urlencoded',
      })
      const endTime = Date.now()

      // This will get the response time duration
      const responseTime = endTime - startTime

      response.headers.forEach((value, key) => {
        setHeaders((prev) => ({ ...prev, [key]: value }))
        form.setValue('responseHeaders', {
          ...form.getValues('responseHeaders')!,
          [key]: value,
        })
        if (key === 'set-cookie' && typeof value === 'string') {
          setCookies((prev) => [...prev, parseCookie(value)])
        }
      })
      const responseData = await (response.headers
        .get('Content-Type')
        ?.includes('application/json')
        ? response.json()
        : response.headers.get('Content-Type')?.includes('image')
        ? response.blob()
        : response.text())
      setResult(responseData)

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
      // auto saving the response
      updateApi(
        {
          ...form.getValues(),
          responseHeaders: form.getValues('responseHeaders'),
          response: JSON.stringify(responseData),
          responseStatus: JSON.stringify(responseStatusData),
        },
        api.id,
      )
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
        if (process.env.NODE_ENV === 'development') {
          console.log(error)
        }
        toast({
          variant: 'error',
          title: 'Error',
          description: error,
        })
        responseData = null
      }
      setIsLoading(false)
    }
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
      data.responseHeaders = form.getValues('responseHeaders')
      data.dynamicVariables = filterEmptyParams(
        form.getValues('dynamicVariables')!,
      )
      data.body = filterEmptyParams(form.getValues('body')!)
      data.formData = filterEmptyParams(form.getValues('formData')!)
      data.pathVariables =
        filterEmptyParams(form.watch('pathVariables')!).length! > 0 &&
        form.watch('url').includes('/:')
          ? filterEmptyParams(form.watch('pathVariables')!)
          : form.watch('url').includes('/:') &&
            !filterEmptyParams(form.watch('pathVariables')!).length
          ? filterEmptyParams(parseURLParameters(form.watch('url'))!)
          : !form.watch('url').includes('/:')
          ? filterEmptyParams(form.watch('pathVariables')!)
          : []
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
      updateTab({
        id: params.apiId,
        name: data.name,
        folderId: folderId,
        isActive: true,
      })
      getApi(params.apiId)
    }
  }, [form, api])

  const copyUrl = () => {
    setIsUrlCopied(true)
    url = containsDynamicVariable(url)
      ? replaceVariables(updateUrlWithPathVariables(url, pathVariables!), env)
      : url.split('://')[1]?.includes('/:')
      ? updateUrlWithPathVariables(url, pathVariables!)
      : url
    url = url.includes('http') ? url : `http://${url}`
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

  const saveRequestFromCurl = (cmd: string, id: string) => {
    if (isCurlCall(cmd)) {
      const data = parseCurlToJson(cmd, id)
      if (data) {
        updateApi(data, id)
        navigate(`/api/${folderId}/${id}`)
        getApi(api?.id)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Api is updated successfully',
        })
      }
    } else {
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Invalid curl command',
      })
    }
  }

  const copyCurl = () => {
    let request = api
    request.url = url
    copy(generateCurlFromJson(request))
    toast({
      variant: 'success',
      title: 'Success',
      description: 'Curl is copied to clipboard',
    })
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
    cookies,
    saveRequestFromCurl,
    curl,
    setCurl,
    copyCurl,
    isProxyAdded,
    setIsProxyAdded,
  }
}
