/* eslint-disable @typescript-eslint/no-explicit-any */
import copy from 'copy-to-clipboard'
import { Check, ChevronsRight, Copy, Settings } from 'lucide-react'

import {
  cn,
  containsDynamicVariable,
  extractVariable,
  getBreadcrumbsForNthChildren,
  replaceVariables,
} from '@/lib/utils'

import { useNavigate } from 'react-router-dom'
import SplitPane, { Pane } from 'split-pane-react'
import useApiComponent from '../../hooks/useApiComponent'
import useResultRenderViewStore from '../../store/resultRenderView'
import Breadcrumbs from '../breadcrumb'
import Loading from '../loading'
import SideNavToggler from '../nav/sidenav-toggler'
import NotFound from '../notFound'
import { Button } from '../ui/button'
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
    urlWidth,
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
  } = useApiComponent()
  const { resultRenderView } = useResultRenderViewStore()
  const navigate = useNavigate()

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
          {api.name}
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
          className="mx-auto relative h-10 flex w-[calc(100%-40px)] items-center justify-between rounded overflow-hidden border p-0"
        >
          <div
            onDoubleClick={() => navigate(`/api/${folderId}/${apiId}/update`)}
            className="flex items-center"
          >
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
                        copy(
                          replaceVariables(`{{${extractVariable(url)}}}`, env),
                        )
                        toast({
                          variant: 'success',
                          title: 'Success',
                          description: 'Env value is copied to clipboard',
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
                  className="mr-2 flex h-8 w-8 justify-self-end p-0"
                  size="sm"
                  onClick={() => navigate(`/api/${folderId}/${apiId}/update`)}
                >
                  <Settings
                    className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
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
              className="px-5 pt-2"
              height={
                resultRenderView === 'vertical'
                  ? window.innerHeight - 140
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
