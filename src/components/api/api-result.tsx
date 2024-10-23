/* eslint-disable @typescript-eslint/no-explicit-any */
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import copy from 'copy-to-clipboard'
import { Check, Columns2, Copy, Download, Rows2, X } from 'lucide-react'
import { memo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { editorOptions, setEditorTheme } from '../../config/editorOptions'
import { cn, downloadFile } from '../../lib/utils'
import useResultRenderViewStore from '../../store/resultRenderView'
import { CookieType } from '../../types/api'
import Loading from '../loading'
import { useTheme } from '../theme-provider'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Separator } from '../ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { toast } from '../ui/use-toast'
import { ResponseStatus } from './api'

type PropsType = {
  isLoading: boolean
  result: any
  height?: number
  responseStatus: ResponseStatus
  headers?: {
    [key: string]: any
  }
  cookies: CookieType[]
}

const ApiResult = ({
  isLoading,
  result,
  height,
  responseStatus,
  headers,
  cookies,
}: PropsType) => {
  const { theme } = useTheme()
  const [isCopiedResponse, setIsCopiedResponse] = useState<boolean>(false)
  const resultDivRef = useRef<HTMLDivElement>(null)
  const { resultRenderView, toggleResultRenderView } =
    useResultRenderViewStore()
  const editorRef = useRef<Monaco>(null)

  const payloadSize = (data: any): string => {
    const json_string = JSON.stringify(data)
    const string_length = new TextEncoder().encode(json_string).length
    const payload_size_kb = +(string_length / 1024).toFixed(2)
    return payload_size_kb > 1 ? `${payload_size_kb} KB` : `${string_length} B`
  }

  const copyResponse = () => {
    setIsCopiedResponse(true)
    copy(JSON.stringify(result))
    toast({
      variant: 'success',
      title: 'Success',
      description: 'Data is copied to clipboard',
    })
    setTimeout(() => {
      setIsCopiedResponse(false)
    }, 2000)
  }

  console.log(headers?.['Content-Type'])

  return (
    <section
      ref={resultDivRef}
      style={{ height }}
      className={cn(
        resultRenderView === 'vertical' ? 'border-l py-1' : 'border-t py-1',
        'bg-background',
      )}
    >
      {isLoading ? (
        <Loading
          name="Connecting"
          height={height! - 300}
        />
      ) : (
        <div className="relative flex justify-between pt-1 pb-3 pl-5 pr-0 text-sm animate__animated animated__fadeIn ">
          <Tabs
            defaultValue="response"
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="headers">
                Headers{' '}
                {typeof headers === 'object' &&
                  Object.keys(headers).length > 0 && (
                    <span className="text-green-500 ml-2 text-xs">
                      {Object.keys(headers).length - 1}
                    </span>
                  )}
              </TabsTrigger>
              <TabsTrigger value="cookies">
                Cookies
                {!!cookies?.length && (
                  <span className="text-green-500 ml-2 text-xs">
                    {cookies?.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="response"
              className="w-full"
              style={{ height: height! - 220 }}
            >
              <div className="relative h-full">
                <Button
                  disabled={
                    (result && Object.entries(result || {})?.length === 0) ||
                    !result
                  }
                  type="button"
                  variant="secondary"
                  className="flex absolute right-9 top-0 h-8 w-8 justify-self-end p-0 z-10"
                  size="sm"
                  onClick={() =>
                    downloadFile({
                      data: result,
                      fileName: `Response-${uuid()}`,
                      fileType: headers?.['content-type']?.includes(
                        'application/json',
                      )
                        ? 'application/json'
                        : headers?.['content-type']?.includes('text/html')
                        ? 'text/html'
                        : 'text/plain',
                    })
                  }
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Download size={18} />
                    </TooltipTrigger>
                    <TooltipContent align="start">
                      Download response
                    </TooltipContent>
                  </Tooltip>
                </Button>
                <Button
                  disabled={
                    (result && Object.entries(result)?.length === 0) || !result
                  }
                  type="button"
                  variant="secondary"
                  className="flex h-8 w-8 justify-self-end p-0 absolute right-0 top-0 z-10"
                  size="sm"
                  onClick={() => copyResponse()}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isCopiedResponse ? (
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
                    </TooltipTrigger>
                    <TooltipContent align="start">Copy response</TooltipContent>
                  </Tooltip>
                </Button>
                <MonacoEditor
                  beforeMount={setEditorTheme}
                  height={height! - 220}
                  className="h-full"
                  saveViewState={true}
                  language={
                    headers?.['content-type']?.includes('application/json')
                      ? 'json'
                      : headers?.['content-type']?.includes('text/html')
                      ? 'html'
                      : 'text'
                  }
                  value={
                    headers?.['content-type']?.includes('application/json')
                      ? JSON.stringify(result, null, '\t')
                      : headers?.['content-type']?.includes('text/html') ||
                        headers?.['content-type']?.includes('text/plain')
                      ? result
                      : JSON.stringify({}, null, '\t')
                  }
                  theme={theme === 'dark' ? 'onedark' : 'light'}
                  options={editorOptions({ readOnly: true })}
                  loading={
                    <Loading
                      name="Connecting"
                      height={height! - 220}
                    />
                  }
                  onMount={(editor: Monaco) => (editorRef.current = editor)}
                />
              </div>
            </TabsContent>
            <TabsContent
              value="headers"
              className="overflow-auto"
              style={{ height: height! - 220 }}
            >
              <Table>
                <TableHeader className="border">
                  <TableRow className="w-full">
                    <TableHead className="border w-1/2 min-w-52">Key</TableHead>
                    <TableHead className="border w-1/2 min-w-80">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeof headers === 'object' &&
                  Object.keys(headers).length > 0 ? (
                    <>
                      {Object.keys(headers!).map((item) => {
                        if (item !== 'set-cookie') {
                          return (
                            <TableRow key={uuid()}>
                              <TableCell
                                key={uuid()}
                                className="border"
                              >
                                {item}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'border',
                                  headers[item].startsWith('{') &&
                                    headers[item].endsWith('}') &&
                                    'p-0',
                                )}
                              >
                                {headers[item].startsWith('{') &&
                                headers[item].endsWith('}') ? (
                                  // <MonacoEditor
                                  //   beforeMount={setEditorTheme}
                                  //   height={
                                  //     JSON.stringify(
                                  //       JSON.parse(headers[item]),
                                  //       null,
                                  //       2,
                                  //     ).split('\n').length * 20
                                  //   }
                                  //   width="100%"
                                  //   saveViewState={true}
                                  //   defaultLanguage="json"
                                  //   value={JSON.stringify(
                                  //     JSON.parse(headers[item]),
                                  //     null,
                                  //     2,
                                  //   )}
                                  //   theme={
                                  //     theme === 'dark' ? 'onedark' : 'light'
                                  //   }
                                  //   options={editorOptions({
                                  //     readOnly: true,
                                  //   })}
                                  //   loading={<Loading />}
                                  //   onMount={(editor: Monaco) =>
                                  //     (editorRef.current = editor)
                                  //   }
                                  // />
                                  <pre className="px-3 break-words text-cyan-500 max-w-fit overflow-x-auto">
                                    {JSON.stringify(
                                      JSON.parse(headers[item]),
                                      null,
                                      2,
                                    )}
                                  </pre>
                                ) : (
                                  headers[item]
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        } else {
                          return null
                        }
                      })}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center border h-40 text-sm text-primary"
                      >
                        Not found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent
              value="cookies"
              className="overflow-auto"
              style={{ height: height! - 230 }}
            >
              <Table>
                <TableHeader className="border">
                  <TableRow className="w-full">
                    <TableHead className="border text-center min-w-52">
                      Key
                    </TableHead>
                    <TableHead className="border text-center min-w-52">
                      Value
                    </TableHead>
                    <TableHead className="border text-center min-w-52">
                      Path
                    </TableHead>
                    <TableHead className="border text-center min-w-52">
                      Expires
                    </TableHead>
                    <TableHead className="border text-center min-w-52">
                      HttpOnly
                    </TableHead>
                    <TableHead className="border text-center min-w-52">
                      Secure
                    </TableHead>
                    <TableHead className="border text-center min-w-52">
                      SameSite
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cookies?.length ? (
                    <>
                      {cookies?.map((item) => (
                        <CookiesTable {...item} />
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center border h-40 text-sm text-primary"
                      >
                        Not found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
          <div className="flex items-center absolute top-1 right-1">
            <Button
              type="button"
              variant="ghost"
              className="mr-2 flex h-8 w-8 justify-self-end p-0"
              size="sm"
              onClick={() => {
                toggleResultRenderView()
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  {resultRenderView === 'vertical' ? (
                    <Rows2
                      size={18}
                      className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
                    />
                  ) : (
                    <Columns2
                      size={18}
                      className="animate__animated animate__fadeIn text-muted-foreground dark:text-foreground"
                    />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {resultRenderView === 'horizontal'
                      ? 'Change to vertical split'
                      : ' Change to horizontal split'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </Button>
            {responseStatus?.status ? (
              <>
                <Separator
                  orientation="vertical"
                  className="h-5 text-muted-foreground mr-1"
                />
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8"
                          >
                            <p className="text-xs">
                              Status
                              <span
                                className={cn(
                                  responseStatus.status
                                    ?.toString()
                                    .startsWith('2', 0)
                                    ? 'ml-1 font-medium text-green-600 dark:font-normal dark:text-green-400'
                                    : 'ml-1 font-medium text-red-500 dark:font-normal',
                                  'mr-2',
                                )}
                              >
                                {responseStatus.status}
                              </span>
                            </p>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        See{' '}
                        {responseStatus.status?.toString().startsWith('2', 0)
                          ? 'success'
                          : 'failed'}{' '}
                        response status
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <p className="mr-4 text-xs">
                        Time:
                        <span className={'pl-1 text-green-500'}>
                          {responseStatus.time}
                        </span>
                      </p>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <p className="mr-2 text-xs">
                        Size:
                        <span className={'ml-1 text-green-500'}>
                          {payloadSize(result)}
                        </span>
                      </p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}

const CookiesTable = ({
  customKey,
  customValue,
  path,
  expires,
  httpOnly,
  secure,
  sameSite,
}: CookieType) => {
  const [isCopied, setIsCopied] = useState(false)
  const copyData = (data: string) => {
    setIsCopied(true)
    copy(data)
    toast({
      variant: 'success',
      title: 'Success',
      description: 'Value is copied to clipboard',
    })
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }
  return (
    <TableRow key={uuid()}>
      <TableCell className="border text-center">{customKey}</TableCell>
      <TableCell className="border text-center relative max-w-72 truncate">
        <span className="truncate text-wrap">{customValue}</span>
        {customValue && (
          <Button
            type="button"
            variant="secondary"
            className="flex h-8 w-8 justify-self-end p-0 absolute right-0 top-0 z-10"
            size="sm"
            onClick={() => copyData(customValue)}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                {isCopied ? (
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy data</p>
              </TooltipContent>
            </Tooltip>
          </Button>
        )}
      </TableCell>
      <TableCell className="border text-center">{path}</TableCell>
      <TableCell className="border text-center">{expires}</TableCell>
      <TableCell className="border text-center">
        <span className="flex justify-center items-center">
          {httpOnly ? <Check size={14} /> : <X size={14} />}
        </span>
      </TableCell>
      <TableCell className="border text-center">
        <span className="flex justify-center items-center">
          {secure ? <Check size={14} /> : <X size={14} />}
        </span>
      </TableCell>
      <TableCell className="border text-center">{sameSite}</TableCell>
    </TableRow>
  )
}

export default memo(ApiResult)
