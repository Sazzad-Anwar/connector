"use client"

import React, { useEffect, useRef, useState } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import useSidepanelToggleStore from "@/store/sidePanelToggle"
import useApiStore from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import copy from "copy-to-clipboard"
import { ChevronRight, Clipboard, Menu, MoveRight } from "lucide-react"
import qs from "qs"
import { SubmitHandler, useForm } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { ApiSchema, ApiType } from "@/types/api"
import {
  arrayToObjectConversion,
  cn,
  getBreadcrumbsForNthChildren,
  getQueryString,
  isEmpty,
} from "@/lib/utils"
import Loading from "@/app/loading"

import Breadcrumbs from "../sideNav/breadcrumb"
import SideNav from "../sideNav/page"
import { Button, buttonVariants } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { toast } from "../ui/use-toast"
import ApiResult from "./api-result"
import InputTabs from "./input-tabs"

export type JSONErrorType = {
  isError: boolean
  error: string
}

export type ResponseStatus = {
  status: number
  statusText: string
  time: string
}

export default function Api() {
  const { api, getApi, collections } = useApiStore()
  let params = useParams()
  let router = useRouter()
  let { toggle, isOpen } = useSidepanelToggleStore()
  let [result, setResult] = useState<any>()
  let [responseStatus, setResponseStatus] = useState<ResponseStatus>({
    status: 0,
    statusText: "",
    time: "",
  })
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
  }, [form, api])

  const onSubmit: SubmitHandler<ApiType> = async (submitData) => {
    const startTime = Date.now()
    try {
      setIsLoading(true)
      let params = isEmpty(submitData.params!)
        ? getQueryString(arrayToObjectConversion(api.params!))
        : getQueryString(arrayToObjectConversion(submitData.params!))

      let url = api.url + (params ? "?" + params : "")

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
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-hidden">
        <div className="flex items-center p-5">
          <Button
            variant="ghost"
            size="xs"
            className="hidden h-8 w-8 rounded border p-0 lg:flex"
            type="button"
            onClick={() => toggle()}
          >
            {isOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
          </Button>
          <Sheet>
            <SheetTrigger
              asChild
              className={cn(
                buttonVariants({ variant: "ghost", size: "xs" }),
                "h-6 w-6 rounded border p-0 lg:hidden"
              )}
            >
              <Menu size={12} />
            </SheetTrigger>
            <SheetContent side="left" className="w-full p-0 sm:w-[300px]">
              <SideNav isLoadingInSheet={true} />
            </SheetContent>
          </Sheet>
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
            <div className=" max-w-[12rem] overflow-hidden truncate px-2 md:max-w-md lg:max-w-lg xl:max-w-4xl 2xl:max-w-7xl">
              {url}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              className="mr-2 flex h-8 w-8 justify-self-end p-1"
              size="sm"
              onClick={() => {
                copy(url)
                toast({
                  variant: "success",
                  title: "Url is copied",
                })
              }}
            >
              <Clipboard size={18} />
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
        <InputTabs form={form} api={api} />
        <button ref={buttonRef} className="hidden" type="submit" />

        <ApiResult
          isLoading={isLoading}
          result={result}
          responseStatus={responseStatus}
        />
      </form>
    </>
  )
}
