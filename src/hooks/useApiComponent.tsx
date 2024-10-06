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
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { ResponseStatus } from '../components/api/api'
import { toast } from '../components/ui/use-toast'
import fetcher from '../lib/fetcher'
import {
  arrayToObjectConversion,
  checkAndReplaceWithDynamicVariable,
  containsDynamicVariable,
  filterEmptyParams,
  generateURLFromParams,
  getQueryString,
  isEmpty,
  replaceVariables,
  updateEnvWithDynamicVariableValue,
  updateUrlWithPathVariables,
} from '../lib/utils'
import useResultRenderViewStore from '../store/resultRenderView'
import useSidePanelToggleStore from '../store/sidePanelToggle'
import useApiStore from '../store/store'
import { ApiSchema, ApiType, ParamsType } from '../types/api'

export default function useApiComponent() {
  const { api, getApi, updateApi, collections, env, getEnv, updateEnv } =
    useApiStore()
  const params = useParams()
  const { resultRenderView } = useResultRenderViewStore()
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
    (window.innerHeight - 320) / 2,
    (window.innerHeight - 320) / 2,
  ])
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
    (item: ParamsType) => item.isActive && item.key !== '',
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
        if (resultRenderView === 'horizontal') {
          setSizes([
            formDivRef.current.clientWidth / 2,
            formDivRef.current.clientWidth / 2,
          ])
        } else {
          setSizes([
            (window.innerHeight -
              (breadCrumbDivRef.current?.clientHeight +
                urlDivRef.current?.clientHeight)) /
              1.8,
            (window.innerHeight -
              (breadCrumbDivRef.current?.clientHeight +
                urlDivRef.current?.clientHeight)) /
              1.8,
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
          : api?.params?.filter((item: ParamsType) => item.isActive)?.length
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
      let url = submitData.pathVariables?.find(
        (item: ParamsType) => item.key !== '',
      )
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
        console.log(resultText)
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

  const saveUpdate = useCallback(() => {
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
      title: 'Success',
      description: 'Api is updated successfully',
    })
    form.reset()
    getApi(api?.id)
  }, [form])

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
    let url = form
      .getValues('pathVariables')
      ?.find((item: ParamsType) => item.key !== '')
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
    updateButtonRef,
    sizes,
    setSizes,
    headers,
    setHeaders,
    responseStatus,
    setResponseStatus,
    buttonRef,
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
    callApi,
    saveUpdate,
    apiId,
    folderId,
    url,
  }
}
