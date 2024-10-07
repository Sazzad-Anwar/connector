/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Check,
  ChevronsRight,
  Copy,
  InfoIcon,
  Pencil,
  Save,
} from 'lucide-react'

import {
  cn,
  containsDynamicVariable,
  containsVariable,
  extractVariable,
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
  replaceVariables,
} from '@/lib/utils'

import { useEffect, useState } from 'react'
import SplitPane, { Pane } from 'split-pane-react'
import useApiComponent from '../../hooks/useApiComponent'
import useResultRenderViewStore from '../../store/resultRenderView'
import { FolderType } from '../../types/api'
import Breadcrumbs from '../breadcrumb'
import Loading from '../loading'
import SideNavToggler from '../nav/sidenav-toggler'
import NotFound from '../notFound'
import { Button, buttonVariants } from '../ui/button'
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
import ApiResult from './api-result'
import ApiTabs from './apiTabs'
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
  const {
    copyUrl,
    url,
    apiId,
    folderId,
    isUrlEditing,
    setIsUrlEditing,
    formDivRef,
    result,
    isUrlCopied,
    breadCrumbDivRef,
    urlDivRef,
    updateButtonRef,
    sizes,
    setSizes,
    headers,
    responseStatus,
    isLoading,
    form,
    onSubmit,
    callApi,
    saveUpdate,
    collections,
    env,
    api,
    isApiNameEditing,
    setIsApiNameEditing,
    getApi,
  } = useApiComponent()
  const { resultRenderView } = useResultRenderViewStore()
  const [isUrlError, setIsUrlError] = useState<boolean>(false)
  const rootParentId = getRootParentIdForNthChildren(collections, folderId)
  const rootParent = collections.find(
    (item: FolderType) => item.id === rootParentId,
  )

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

  const setBorderColor = (isError: boolean) =>
    isError ? 'border-destructive' : ''

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
    return <Loading className="h-screen" />
  }

  return (
    <>
      <ApiTabs />
      <form
        ref={formDivRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="overflow-hidden"
        style={{ height: window.innerHeight }}
      >
        <div
          ref={breadCrumbDivRef}
          className="flex items-center px-5 py-3"
        >
          <SideNavToggler />
          <Breadcrumbs
            breadcrumbs={getBreadcrumbsForNthChildren(collections, folderId!)}
          />
          <ChevronsRight
            size={13}
            className="mx-2"
          />
          <div className="flex items-center group">
            {isApiNameEditing ? (
              <Input
                value={form.watch('name')}
                onChange={(e) => {
                  form.setValue('name', e.target.value, {
                    shouldDirty: true,
                  })
                }}
                autoFocus
                className={cn(
                  'bg-transparent h-auto px-1 py-px text-base w-auto border',
                )}
                // onBlur={() => setIsApiNameEditing(false)}
              />
            ) : (
              <span className="text-base h-auto px-1 py-px w-auto border border-transparent">
                {form.watch('name')}
              </span>
            )}
            {!isApiNameEditing ? (
              <Pencil
                onClick={() => setIsApiNameEditing(true)}
                size={12}
                className="ml-1 group-hover:visible invisible cursor-pointer"
              />
            ) : (
              <span
                className={buttonVariants({
                  size: 'icon',
                  variant: 'secondary',
                  className: 'p-0 w-7 h-7 ml-1 cursor-pointer',
                })}
                onClick={() => {
                  saveUpdate()
                  setIsApiNameEditing(false)
                }}
              >
                <Check size={12} />
              </span>
            )}
          </div>

          {!!Object.entries(form.formState.dirtyFields).length && (
            <Button
              ref={updateButtonRef}
              onClick={() => saveUpdate()}
              type="button"
              variant="destructive"
              size="xs"
              className="py-.5 px-1 ml-2 text-xs mt-px"
            >
              Save
            </Button>
          )}
        </div>
        <div
          ref={urlDivRef}
          className={cn(
            'mx-auto relative h-10 flex w-[calc(100%-40px)] items-center justify-between rounded overflow-hidden border p-0',
            isUrlError ? 'text-red-500' : '',
          )}
        >
          {isUrlEditing ? (
            <div className="flex w-full items-center">
              <Select
                onValueChange={(value) =>
                  form.setValue(
                    'method',
                    value as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
                  )
                }
                value={form.watch('method') ?? 'GET'}
              >
                <SelectTrigger
                  className={cn(
                    form.getValues('method') === 'GET'
                      ? ' bg-green-700 border border-green-500'
                      : form.getValues('method') === 'POST'
                      ? 'bg-yellow-700 border-yellow-500'
                      : form.getValues('method') === 'PUT'
                      ? 'bg-cyan-700 border-cyan-500'
                      : form.getValues('method') === 'PATCH'
                      ? 'bg-purple-700 border-purple-500'
                      : 'bg-red-700 border-red-500',
                    'w-auto h-6 mx-h-6 border-0 font-medium text-white ml-1.5 text-xs pl-2 pr-1 py-0',

                    setBorderColor(
                      !!form.formState.errors.method || isUrlError,
                    ),
                  )}
                >
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((item) => (
                    <SelectItem
                      className={
                        (item === 'GET'
                          ? 'text-green-500'
                          : item === 'POST'
                          ? 'text-yellow-500'
                          : item === 'PUT'
                          ? 'text-cyan-500'
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

              <Input
                autoComplete="off"
                placeholder="Url"
                autoFocus
                value={form.watch('url')}
                size={200}
                onChange={(e) => {
                  if (
                    e.target.value.includes('?') ||
                    e.target.value.includes('&')
                  ) {
                    e.target.value = e.target.value
                      .replace('?', '')
                      .replace('&', '')
                  } else {
                    form.setValue('url', e.target.value, {
                      shouldDirty: true,
                    })
                  }
                }}
                className={cn(
                  setBorderColor(isUrlError),
                  'text-base rounded-l-none pl-1 h-full border-0',
                )}
              />

              <Tooltip>
                <TooltipTrigger>
                  {isUrlError && (
                    <InfoIcon className="mb-2 ml-2 text-destructive" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>It is not a valid variable</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center">
              <span
                className={cn(
                  api.method === 'GET'
                    ? ' bg-green-700 border border-green-500'
                    : api.method === 'POST'
                    ? 'bg-yellow-700 border-yellow-500'
                    : api.method === 'PUT'
                    ? 'bg-cyan-700 border-cyan-500'
                    : api.method === 'PATCH'
                    ? 'bg-purple-700 border-purple-500'
                    : 'bg-red-700 border-red-500',
                  'font-medium text-white ml-1.5 text-xs px-1 py-0.5 rounded-md',
                )}
              >
                {api.method}
              </span>
              <div
                onDoubleClick={() => setIsUrlEditing(true)}
                className="truncate px-2"
              >
                {containsDynamicVariable(url) ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-cyan-500">{`{{${extractVariable(
                        url,
                      )}}}`}</span>
                    </TooltipTrigger>
                    <TooltipContent
                      className="flex items-center text-base"
                      onClick={() => {
                        copyUrl()
                        toast({
                          variant: 'success',
                          title: 'Success',
                          description: 'Env value is copied to clipboard',
                        })
                      }}
                    >
                      {replaceVariables(`{{${extractVariable(url)}}}`, env)}

                      <Copy
                        className="h-4 w-4 justify-self-end p-0 ml-2 cursor-pointer"
                        size={16}
                      />
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  form.watch('url')
                  // url
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{url?.split('}}')[1]}</span>
                  </TooltipTrigger>
                  <TooltipContent>Double click to edit this URL</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end absolute right-0 h-auto bg-background pl-1">
            {!isUrlEditing && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex justify-self-end px-3 rounded-none"
                      size="sm"
                      onClick={() => copyUrl()}
                    >
                      {isUrlCopied ? (
                        <Check
                          className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
                          size={18}
                        />
                      ) : (
                        <Copy
                          className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
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
                      className="flex justify-self-end px-3 rounded-none"
                      size="sm"
                      onClick={() => setIsUrlEditing(true)}
                    >
                      <Pencil
                        className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
                        size={17}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Url</TooltipContent>
                </Tooltip>
              </>
            )}
            {isUrlEditing ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      saveUpdate()
                      getApi(api?.id)
                    }}
                    className={buttonVariants({
                      className: 'p-1 rounded-l-none cursor-pointer',
                      variant: 'secondary',
                      size: 'icon',
                    })}
                  >
                    <Save size={18} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Save Url</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => callApi()}
                    className="p-1 rounded-l-none"
                    variant="secondary"
                    size="icon"
                  >
                    <i className="bi bi-plugin text-xl font-bold" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send request</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <SplitPane
          sashRender={() => <></>}
          split={resultRenderView}
          sizes={sizes}
          onChange={(sizes) => setSizes(sizes)}
        >
          <Pane
            minSize={
              resultRenderView === 'vertical'
                ? formDivRef?.current?.clientWidth &&
                  formDivRef?.current?.clientWidth / 3
                : 5
            }
            maxSize="100%"
          >
            <InputTabs
              className={cn(
                'px-5 pt-2',
                resultRenderView === 'horizontal'
                  ? `w-[${sizes[0] - 120}px]`
                  : '',
              )}
              height={
                resultRenderView === 'vertical'
                  ? window.innerHeight - 200
                  : sizes[0]
              }
              form={form}
              api={api}
            />
          </Pane>

          <Pane
            minSize={
              resultRenderView === 'vertical'
                ? formDivRef?.current?.clientWidth &&
                  formDivRef?.current?.clientWidth / 2.9
                : 80
            }
            maxSize="100%"
          >
            <ApiResult
              height={
                resultRenderView === 'vertical'
                  ? window.innerHeight + 20
                  : sizes[1]! + 20
              }
              isLoading={isLoading}
              result={result}
              headers={headers}
              responseStatus={responseStatus}
            />
          </Pane>
        </SplitPane>
      </form>
    </>
  )
}
