/* eslint-disable @typescript-eslint/no-explicit-any */
import copy from 'copy-to-clipboard'
import { Check, Columns2, Copy, Rows2, X } from 'lucide-react'
import { useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { cn, parseCookie } from '../../lib/utils'
import Loading from '../loading'
import ResultRender from '../result-renderer'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { ResponseStatus } from './api'

type PropsType = {
  isLoading: boolean
  result: any
  height?: number
  responseStatus: ResponseStatus
  headers?: {
    [key: string]: any
  }
}

export default function ApiResult({
  isLoading,
  result,
  height,
  responseStatus,
  headers,
}: PropsType) {
  const resultDivRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const resultRenderView = searchParams.get('view')
  const resultContainerRef = useRef<HTMLDivElement>(null)

  const payloadSize = (data: any): string => {
    // Convert JSON data to string
    // Convert JSON data to string
    const json_string = JSON.stringify(data)

    // Calculate length of string in bytes
    const string_length = new TextEncoder().encode(json_string).length

    // Convert payload size to KB
    const payload_size_kb = +(string_length / 1024).toFixed(2)
    return payload_size_kb > 1 ? `${payload_size_kb} KB` : `${string_length} B`
  }

  return (
    <section
      ref={resultDivRef}
      className={cn(
        resultRenderView === 'horizontal' ? 'border-l py-1' : 'border-t py-1',
        'bg-background',
      )}
      style={{
        height,
      }}
    >
      {isLoading ? (
        <Loading height={height! - 300} />
      ) : (
        <div className="relative pt-1 pb-3 pl-5 pr-0 text-sm">
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
                    <span className="text-green-500 ml-2">
                      ({Object.keys(headers).length - 1})
                    </span>
                  )}
              </TabsTrigger>
              <TabsTrigger value="cookies">
                Cookies
                {typeof headers === 'object' &&
                  headers['set-cookie']?.length > 0 && (
                    <span className="text-green-500 ml-2">
                      ({headers['set-cookie']?.length})
                    </span>
                  )}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="response"
              className="w-full"
            >
              <ResultRender
                ref={resultContainerRef}
                readOnly={true}
                height={height}
                type="response"
                result={result ?? {}}
              />
            </TabsContent>
            <TabsContent
              value="headers"
              className="max-h-fit overflow-auto"
            >
              <Table>
                <TableHeader className="border">
                  <TableRow className="w-full">
                    <TableHead className="border w-1/2">Key</TableHead>
                    <TableHead className="border w-1/2">Value</TableHead>
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
                                key={uuid()}
                                className="border"
                              >
                                {headers[item]}
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
            <TabsContent value="cookies">
              <Table>
                <TableHeader className="border">
                  <TableRow className="w-full">
                    <TableHead className="border">Key</TableHead>
                    <TableHead className="border">Value</TableHead>
                    <TableHead className="border">Path</TableHead>
                    <TableHead className="border">Expires</TableHead>
                    <TableHead className="border text-center">
                      HttpOnly
                    </TableHead>
                    <TableHead className="border text-center">Secure</TableHead>
                    <TableHead className="border text-center">
                      SameSite
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typeof headers === 'object' &&
                  headers['set-cookie']?.length ? (
                    <>
                      {headers['set-cookie']?.map((item: string) => {
                        const {
                          customKey,
                          customValue,
                          expires,
                          path,
                          secure,
                          httpOnly,
                          sameSite,
                        } = parseCookie(item)

                        return (
                          <TableRow key={uuid()}>
                            <TableCell className="border">
                              {customKey}
                            </TableCell>
                            <TableCell className="border">
                              <Tooltip>
                                <TooltipTrigger>{customValue}</TooltipTrigger>
                                <TooltipContent className="max-w-[600px] w-full break-words relative p-2 pr-5 rounded-md bg-secondary">
                                  <span className="text-xs w-full">
                                    {customValue}
                                    <Copy
                                      onClick={() => copy(customValue)}
                                      className="animate__animated animate__fadeIn cursor-pointer absolute right-1 top-1"
                                      size={16}
                                    />
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="border">{path}</TableCell>
                            <TableCell className="border">{expires}</TableCell>
                            <TableCell className="border">
                              <span className="flex justify-center items-center">
                                {httpOnly ? (
                                  <Check size={14} />
                                ) : (
                                  <X size={14} />
                                )}
                              </span>
                            </TableCell>
                            <TableCell className="border">
                              <span className="flex justify-center items-center">
                                {secure ? <Check size={14} /> : <X size={14} />}
                              </span>
                            </TableCell>
                            <TableCell className="border text-center">
                              {sameSite}
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
                if (resultRenderView === 'horizontal') {
                  navigate({
                    search: searchParams.get('activeQuery')
                      ? `activeQuery=${searchParams.get(
                          'activeQuery',
                        )}&view=vertical`
                      : 'view=vertical',
                  })
                } else {
                  navigate({
                    search: searchParams.get('activeQuery')
                      ? `activeQuery=${searchParams.get(
                          'activeQuery',
                        )}&view=horizontal`
                      : 'view=horizontal',
                  })
                }
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  {resultRenderView === 'horizontal' ? (
                    <Columns2
                      size={18}
                      className="animate__animated animate__fadeIn"
                    />
                  ) : (
                    <Rows2
                      size={18}
                      className="animate__animated animate__fadeIn"
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
                <p className="text-xs">
                  Status
                  <span
                    className={cn(
                      responseStatus.status?.toString().startsWith('2', 0)
                        ? 'ml-1 font-medium text-green-600 dark:font-normal dark:text-green-400'
                        : 'ml-1 font-medium text-red-500 dark:font-normal',
                      'mr-2',
                    )}
                  >
                    {responseStatus.status}
                  </span>
                </p>
                <p className="mr-4 text-xs">
                  Time:
                  <span className={'pl-1 text-green-500'}>
                    {responseStatus.time}
                  </span>
                </p>
                <p className="mr-2 text-xs">
                  Size:
                  <span className={'ml-1 text-green-500'}>
                    {payloadSize(result)}
                  </span>
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}
