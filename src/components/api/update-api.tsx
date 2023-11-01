import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronsRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import {
  cn,
  containsDynamicVariable,
  containsVariable,
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
  isEmpty,
  parseURLParameters,
  parseURLQueryParameters,
} from '@/lib/utils'
import { ApiSchema, ApiType, FolderType } from '@/types/api'

import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../breadcrumb'
import SidenavToggler from '../nav/sidenav-toggler'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem } from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { toast } from '../ui/use-toast'
import InputTabs from './input-tabs'

export default function UpdateApi() {
  const navigate = useNavigate()
  const params = useParams()
  const updateButtonRef = useRef<HTMLButtonElement>(null)
  const folderId = params.folderId as string
  const apiId = params.apiId as string
  const { collections, updateApi, api, getApi } = useApiStore()
  const form = useForm<ApiType>({
    mode: 'onChange',
    resolver: zodResolver(ApiSchema),
  })
  const url = form.watch('url')
  const [isUrlError, setIsUrlError] = useState<boolean>(false)
  const rootParentId = getRootParentIdForNthChildren(collections, folderId)
  const rootParent = collections.find(
    (item: FolderType) => item.id === rootParentId,
  )
  const onSubmit: SubmitHandler<ApiType> = (data) => {
    data.id = api.id
    data.params = isEmpty(data.params!) ? [] : data.params
    data.headers = isEmpty(data.headers!) ? [] : data.headers
    data.dynamicVariables = isEmpty(data.dynamicVariables!)
      ? []
      : data.dynamicVariables
    data.body = isEmpty(data.body!) ? [] : data.body
    data.pathVariables = !data.url?.includes('/:')
      ? []
      : isEmpty(data.pathVariables!)
      ? []
      : data.pathVariables

    updateApi(data, api.id)
    toast({
      variant: 'success',
      title: 'Api is updated',
    })
    navigate(`/api/${folderId}/${data.id}`)
  }

  useEffect(() => {
    if (apiId) {
      getApi(apiId)
    }
  }, [apiId, getApi])

  useEffect(() => {
    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        updateButtonRef.current?.click()
      }
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        navigate(-1)
      }
    }

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleEscapeKeyPress)

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress)
    }
  }, [navigate, form])

  useEffect(() => {
    const urlParams = parseURLParameters(url)
    const queryParams = parseURLQueryParameters(url!)
    if (urlParams.length) {
      form.setValue('pathVariables', urlParams)
    }

    if (queryParams.length) {
      form.setValue('params', queryParams)
    }
  }, [form, url])

  useEffect(() => {
    if (api) {
      form.setValue('id', api?.id ?? '')
      form.setValue('name', api?.name ?? '')
      form.setValue('method', api?.method ?? 'GET')
      form.setValue('url', api.url)
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
      form.setValue(
        'dynamicVariables',
        api?.dynamicVariables?.length
          ? api?.dynamicVariables
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
      form.setValue(
        'pathVariables',
        api?.pathVariables?.length
          ? api?.pathVariables
          : [{ id: uuid(), key: '', value: '', description: '' }],
      )
    }
  }, [form, api])

  useEffect(() => {
    if (
      containsDynamicVariable(url) &&
      !containsVariable(url, rootParent?.env ?? [])
    ) {
      setIsUrlError(true)
    } else {
      setIsUrlError(false)
    }
  }, [rootParent, url, form])

  const setBorderColor = (isError: boolean) =>
    isError ? 'border-destructive' : ''

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex items-center space-y-0 px-5 pt-5">
              <SidenavToggler />
              <Breadcrumbs
                breadcrumbs={getBreadcrumbsForNthChildren(
                  collections,
                  folderId,
                )}
              />
              <ChevronsRight
                size={18}
                className="mx-2"
              />
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Api Name"
                  {...field}
                  value={field.value ?? ''}
                  className={cn(
                    setBorderColor(!!form.formState.errors.name),
                    'w-full min-w-max',
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="mt-4 flex w-full items-center px-5">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem className="mr-2">
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={
                        (field.value === 'GET'
                          ? 'text-green-500'
                          : field.value === 'POST'
                          ? 'text-yellow-500'
                          : field.value === 'PUT'
                          ? 'text-blue-500'
                          : field.value === 'PATCH'
                          ? 'text-purple-500'
                          : field.value === 'DELETE'
                          ? 'text-destructive'
                          : 'text-foreground') +
                        ' font-bold w-24 ' +
                        setBorderColor(!!form.formState.errors.method)
                      }
                    >
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((item) => (
                      <SelectItem
                        className={
                          (item === 'GET'
                            ? 'text-green-500'
                            : item === 'POST'
                            ? 'text-yellow-500'
                            : item === 'PUT'
                            ? 'text-blue-500'
                            : item === 'PATCH'
                            ? 'text-purple-500'
                            : 'text-destructive') + ' font-bold'
                        }
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex items-center">
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="Url"
                    {...field}
                    size={200}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      if (e.target.value.includes('?')) {
                        e.target.value = e.target.value.replace('?', '')
                      }
                      if (e.target.value.includes('&')) {
                        e.target.value = e.target.value.replace('&', '')
                      }
                      field.onChange(e)
                    }}
                    className={cn(
                      isUrlError ? 'text-red-500' : '',
                      setBorderColor(isUrlError),
                    )}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <InputTabs
          className="p-5 overflow-auto"
          form={form}
          api={api}
        />
        <div className="mr-5 flex justify-end">
          <Button
            variant="outline"
            className="mr-2"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            ref={updateButtonRef}
            disabled={isUrlError}
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
