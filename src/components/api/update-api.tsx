import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronsRight, Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import {
  cn,
  containsDynamicVariable,
  containsVariable,
  filterEmptyParams,
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
  parseURLParameters,
  parseURLQueryParameters,
} from '@/lib/utils'
import { ApiSchema, ApiType, FolderType } from '@/types/api'

import { useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../breadcrumb'
import SideNavToggler from '../nav/sidenav-toggler'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
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
    data.params = filterEmptyParams(form.getValues('params')!)
    data.headers = filterEmptyParams(form.getValues('headers')!)
    data.dynamicVariables = filterEmptyParams(
      form.getValues('dynamicVariables')!,
    )
    data.body = filterEmptyParams(form.getValues('body')!)
    data.pathVariables = form.getValues('url').includes('/:')
      ? filterEmptyParams(form.getValues('pathVariables')!)
      : []
    data.jsonBody = form.getValues('jsonBody')
    data.jsonBody = form.getValues('jsonBody')
      ? form.getValues('jsonBody')
      : api.jsonBody
    updateApi(data, api.id)
    toast({
      variant: 'success',
      title: 'Success',
      description: 'Api is updated successfully',
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
      <form
        className="m-5 h-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <SideNavToggler />
              <Breadcrumbs
                breadcrumbs={getBreadcrumbsForNthChildren(
                  collections,
                  folderId,
                )}
              />
              <ChevronsRight
                size={13}
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
                    'text-base h-7',
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="mt-4 flex w-full items-center">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        field.value === 'GET'
                          ? 'text-green-500'
                          : field.value === 'POST'
                          ? 'text-yellow-500'
                          : field.value === 'PUT'
                          ? 'text-blue-500'
                          : field.value === 'PATCH'
                          ? 'text-purple-500'
                          : field.value === 'DELETE'
                          ? 'text-red-500'
                          : 'text-foreground',
                        'font-bold w-24 border-r-0 rounded-r-none h-8',
                        setBorderColor(
                          !!form.formState.errors.method || isUrlError,
                        ),
                      )}
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
                            : 'text-red-500') + ' font-bold'
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
              <FormItem className="flex items-center h-8">
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
                      isUrlError ? 'text-red-500 border-l' : 'border-l-0',
                      setBorderColor(isUrlError),
                      'text-base rounded-l-none pl-1 h-8',
                    )}
                  />
                </FormControl>
                <Tooltip>
                  <TooltipTrigger>
                    {isUrlError && (
                      <Info className="mb-2 ml-2 text-destructive" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>It is not a valid variable</p>
                  </TooltipContent>
                </Tooltip>
              </FormItem>
            )}
          />
        </div>
        <InputTabs
          className="pt-5"
          form={form}
          type="create"
          height={window?.innerHeight - 200}
        />
        <div className="mt-5 flex justify-end">
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
