"use client"

import React, { useEffect, useRef, useState } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import useApiStore from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import copy from "copy-to-clipboard"
import { Clipboard, MoveRight } from "lucide-react"
import { useTheme } from "next-themes"
import qs from "qs"
import { SubmitHandler, useForm } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { ApiSchema, ApiType, ParamsType } from "@/types/api"
import {
  arrayToObjectConversion,
  cn,
  getBreadcrumbsForNthChildren,
  getQueryString,
  isEmpty,
} from "@/lib/utils"
import Loading from "@/app/loading"

import Loader from "./loader"
import MultipleInput from "./multiple-input"
import ResultRender from "./result-render"
import Breadcrumbs from "./sideNav/breadcrumb"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { toast } from "./ui/use-toast"

export type JSONErrorType = {
  isError: boolean
  error: string
}

type ResponseStatus = {
  status: number
  statusText: string
  time: string
}

export default function Api() {
  const { api, getApi, collections } = useApiStore()
  let params = useParams()
  let router = useRouter()
  let [result, setResult] = useState<any>()
  let [jsonBodyData, setJsonBodyData] = useState<any>({})
  let [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    status: 0,
    statusText: "",
    time: "",
  })
  let [jsonError, setJsonError] = useState<JSONErrorType>()
  let buttonRef = useRef<HTMLButtonElement>(null)
  let [isLoading, setIsLoading] = useState<boolean>(false)
  const form = useForm<ApiType>({
    mode: "onChange",
    resolver: zodResolver(ApiSchema),
  })
  let customParams = form.watch("params")
  let url = !isEmpty(customParams!)
    ? api.url + "?" + qs.stringify(arrayToObjectConversion(customParams!))
    : api.url
  const apiId = params.api[1]
  const folderId = params.api[0]

  useEffect(() => {
    if (apiId && folderId) {
      getApi(apiId!)
    } else {
      router.push("/")
    }
  }, [apiId, folderId, getApi, router])

  useEffect(() => {
    form.setValue("id", api?.id ?? "")
    form.setValue("name", api?.name ?? "")
    form.setValue("method", api?.method ?? "GET")
    form.setValue("url", api?.url ?? "")
    form.setValue(
      "params",
      api?.params?.length
        ? api?.params
        : [{ id: uuid(), key: "", value: "", description: "" }]
    )
    form.setValue(
      "headers",
      api?.headers?.length
        ? api?.headers
        : [{ id: uuid(), key: "", value: "", description: "" }]
    )
    form.setValue(
      "body",
      api?.body?.length
        ? api?.body
        : [{ id: uuid(), key: "", value: "", description: "" }]
    )
    setJsonBodyData(arrayToObjectConversion(api.body!))
  }, [form, api])

  const setJsonBody = (data: string) => {
    try {
      setJsonBodyData(JSON.parse(data))
      let jsonData = JSON.parse(data)
      let jsonArray = [] as ParamsType[]

      Object.keys(jsonData).map((item) => {
        let data = { key: item, value: jsonData[item] as any, id: uuid() }
        jsonArray.push(data)
      })

      form.setValue("body", jsonArray)

      setJsonError({
        isError: false,
        error: "",
      })
    } catch (error: any) {
      setJsonError({
        isError: true,
        error: error.message,
      })
    }
  }

  const onSubmit: SubmitHandler<ApiType> = async (submitData) => {
    const startTime = Date.now()
    try {
      setIsLoading(true)
      let params = isEmpty(submitData.params!)
        ? getQueryString(arrayToObjectConversion(api.params!))
        : getQueryString(arrayToObjectConversion(submitData.params!))

      let url = api.url + "?" + params

      let requestBody = arrayToObjectConversion(submitData.body!)
      let headers = arrayToObjectConversion(submitData.headers!)

      let response = await axios({
        method: api.method,
        url,
        data: requestBody,
        headers: headers,
        timeout: 4000,
      })
      const endTime = Date.now()
      const responseTime = endTime - startTime
      setResult(response.data)
      setResponseStatus({
        status: response?.status,
        statusText: response?.statusText,
        time: (responseTime as number) + "ms",
      })

      setIsLoading(false)
    } catch (error: any) {
      setResult(error?.response ? error?.response?.data : error?.message)
      setIsLoading(false)
    }
  }

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

  const callApi = async () => {
    buttonRef.current?.click()
  }

  if (
    apiId === "undefined" ||
    apiId === "null" ||
    folderId === "undefined" ||
    folderId === "null" ||
    !collections?.length
  ) {
    notFound()
  }
  if (apiId && folderId && !api.id) {
    return <Loading />
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-center p-5">
        <Breadcrumbs
          breadcrumbs={getBreadcrumbsForNthChildren(collections, folderId!)}
        />
        <MoveRight size={13} className="mx-2" />
        {api.name}
      </div>
      <div className="mx-auto flex w-[calc(100%-40px)] items-center justify-between rounded border p-1">
        <div className="flex items-center">
          <span
            className={
              (api.method === "GET"
                ? "text-green-500"
                : api.method === "POST"
                ? "text-yellow-500"
                : api.method === "PUT"
                ? "text-blue-500"
                : api.method === "PATCH"
                ? "text-purple-500"
                : api.method === "DELETE"
                ? "text-destructive"
                : "text-foreground") + " font-bold px-2 border-r"
            }
          >
            {api.method}
          </span>
          <div className="max-w-screen-xl overflow-hidden truncate px-2">
            {url}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            className="mr-2 flex justify-self-end p-1"
            size="sm"
            onClick={() => {
              copy(url)
              toast({
                variant: "success",
                title: "Url is copied",
              })
            }}
          >
            <Clipboard />
          </Button>
          <Button
            onClick={() => callApi()}
            className="rounded text-white"
            size="sm"
          >
            Connect
          </Button>
        </div>
      </div>
      <div className="min-h-[275px] p-5 pb-0">
        <Tabs defaultValue="params" className="w-full">
          <TabsList>
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="headers">Headers </TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
          <TabsContent
            value="params"
            className="animate__animated animate__fadeIn h-52 overflow-auto"
          >
            <MultipleInput propertyName="params" form={form} />
          </TabsContent>
          <TabsContent
            value="headers"
            className="animate__animated animate__fadeIn h-52 overflow-auto"
          >
            <MultipleInput propertyName="headers" form={form} />
          </TabsContent>
          <TabsContent
            value="body"
            className="animate__animated animate__fadeIn"
          >
            <Tabs defaultValue="x-www-form-urlencoded" className="w-full">
              <TabsList className="px-.5 h-9">
                <TabsTrigger value="x-www-form-urlencoded" className="h-7">
                  x-www-form-urlencoded
                </TabsTrigger>
                <TabsTrigger value="raw" className="h-7">
                  Raw JSON
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="raw"
                className="animate__animated animate__fadeIn h-52 overflow-auto"
              >
                {jsonError?.isError ? (
                  <div className="h-4 text-xs font-bold text-red-500">
                    {jsonError.error}
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
                <ResultRender
                  result={jsonBodyData}
                  height={197}
                  readOnly={false}
                  setData={setJsonBody}
                />
              </TabsContent>
              <TabsContent
                value="x-www-form-urlencoded"
                className="animate__animated animate__fadeIn relative h-52 overflow-auto"
              >
                <MultipleInput propertyName="body" form={form} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
      <button ref={buttonRef} className="hidden" type="submit" />

      <section className=" h-[520px] overflow-hidden border-t py-1">
        {isLoading && <Loader />}
        {!isLoading && result && (
          <>
            <div className="flex items-center justify-between pb-1 pl-10 pr-5 text-sm">
              <h1 className="text-base">Response</h1>
              <div className="flex items-center">
                <p
                  className={cn(
                    responseStatus.status?.toString().startsWith("2", 0)
                      ? "ml-1 font-medium text-green-600 dark:font-normal dark:text-green-400"
                      : "ml-1 font-medium text-red-500 dark:font-normal",
                    "mr-2"
                  )}
                >
                  {responseStatus.status} {responseStatus.statusText}
                </p>
                <p className="mr-4">
                  Time:
                  <span className={"pl-1 text-green-500"}>
                    {responseStatus.time}
                  </span>
                </p>
                <p className="mr-2">
                  Size:
                  <span className={"ml-1 text-green-500"}>
                    {payloadSize(result)}
                  </span>
                </p>
              </div>
            </div>
            <ResultRender height={520} result={result && result} />
          </>
        )}
      </section>
    </form>
  )
}
