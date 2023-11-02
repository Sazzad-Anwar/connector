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
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
  isEmpty,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { toast } from '../ui/use-toast'
import InputTabs from './input-tabs'

export default function AddApi() {
  const navigate = useNavigate()
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const params = useParams()
  const folderId = params.folderId as string
  const { collections, createApi } = useApiStore()
  const form = useForm<ApiType>({
    mode: 'onChange',
    resolver: zodResolver(ApiSchema),
    defaultValues: {
      name: 'New Api',
      method: 'GET',
    },
  })
  const [isUrlError, setIsUrlError] = useState<boolean>(false)
  const url = form.watch('url')
  const rootParentId = getRootParentIdForNthChildren(collections, folderId)
  const rootParent = collections.find(
    (item: FolderType) => item.id === rootParentId,
  )

  const onSubmit: SubmitHandler<ApiType> = (data) => {
    data.id = uuid()
    data.params = isEmpty(data.params!) ? [] : data.params
    data.headers = isEmpty(data.headers!) ? [] : data.headers
    data.body = isEmpty(data.body!) ? [] : data.body
    data.dynamicVariables = isEmpty(data.dynamicVariables!)
      ? []
      : data.dynamicVariables
    data.pathVariables = isEmpty(data.pathVariables!) ? [] : data.pathVariables
    createApi(data, folderId)
    toast({
      variant: 'success',
      title: 'Api is created',
    })
    navigate(`/api/${folderId}/${data.id}`)
  }

  useEffect(() => {
    form.setValue('id', '')
    form.setValue('name', '')
    form.setValue('method', 'GET')
    form.setValue('url', '')
    form.setValue('params', [
      { id: uuid(), key: '', value: '', description: '' },
    ])
    form.setValue('headers', [
      { id: uuid(), key: '', value: '', description: '' },
    ])
    form.setValue('body', [{ id: uuid(), key: '', value: '', description: '' }])
    form.setValue('dynamicVariables', [
      { id: uuid(), key: '', value: '', description: '' },
    ])
    form.setValue('pathVariables', [
      { id: uuid(), key: '', value: '', description: '' },
    ])
  }, [form])

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
    if (
      containsDynamicVariable(url) &&
      !containsVariable(url, rootParent?.env ?? [])
    ) {
      setIsUrlError(true)
    } else {
      setIsUrlError(false)
    }
  }, [rootParent, url])

  useEffect(() => {
    const handleEscapeKeyPress = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        saveButtonRef.current?.click()
        form.reset()
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
                  className={setBorderColor(!!form.formState.errors.name)}
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
                <TooltipProvider>
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
                </TooltipProvider>
              </FormItem>
            )}
          />
        </div>
        <InputTabs
          className="pt-5 h-auto"
          form={form}
          // height={window.innerHeight - 160}
        />
        <div className="flex mt-5 justify-end">
          <Button
            ref={saveButtonRef}
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
