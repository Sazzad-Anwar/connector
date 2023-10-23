import React, { useEffect, useRef, useState } from "react"
import { Maximize } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { ApiType, ParamsType } from "@/types/api"
import { arrayToObjectConversion } from "@/lib/utils"

import MultipleInput from "../multiple-input"
import ResultRender from "../result-render"
import { Button } from "../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { JSONErrorType } from "./api"

type PropsType = {
  form: UseFormReturn<ApiType, any, undefined>
  api?: ApiType
}

export default function InputTabs({ form, api }: PropsType) {
  let jsonBodyDivRef = useRef<HTMLDivElement>(null)
  let [isJSONInputFullScreen, setIsJSONInputFullScreen] =
    useState<boolean>(false)
  let [jsonBodyData, setJsonBodyData] = useState<any>({})
  let [jsonError, setJsonError] = useState<JSONErrorType>()

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

  useEffect(() => {
    function onFullscreenChange() {
      setIsJSONInputFullScreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  useEffect(() => {
    if (api?.id) {
      setJsonBodyData(arrayToObjectConversion(api?.body!))
    }
  }, [api])

  return (
    <div className="min-h-[275px] p-5 pb-0 pr-0">
      <Tabs defaultValue="params" className="w-full">
        <TabsList>
          <TabsTrigger value="params">
            Params{" "}
            {api?.params?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="headers">
            Headers{" "}
            {api?.headers?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}{" "}
          </TabsTrigger>
          <TabsTrigger value="body">
            Body{" "}
            {api?.body?.length ? (
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500" />
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="params"
          className="animate__animated animate__fadeIn my-5 h-52 overflow-auto"
        >
          <MultipleInput propertyName="params" form={form} />
        </TabsContent>
        <TabsContent
          value="headers"
          className="animate__animated animate__fadeIn h-52 overflow-auto"
        >
          <MultipleInput propertyName="headers" form={form} />
        </TabsContent>
        <TabsContent value="body" className="animate__animated animate__fadeIn">
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
              className="animate__animated animate__fadeIn"
            >
              <div className="flex items-center justify-between">
                {jsonError?.isError ? (
                  <div className="h-4 text-xs font-bold text-red-500">
                    {jsonError.error}
                  </div>
                ) : (
                  <div className="h-4"></div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-5 w-5 p-0"
                >
                  <Maximize
                    onClick={() => {
                      jsonBodyDivRef.current?.requestFullscreen()
                      setIsJSONInputFullScreen(true)
                    }}
                    size={13}
                  />
                </Button>
              </div>
              <ResultRender
                ref={jsonBodyDivRef}
                result={jsonBodyData}
                height={
                  isJSONInputFullScreen
                    ? typeof window !== "undefined"
                      ? window.outerHeight
                      : 197
                    : 197
                }
                readOnly={false}
                setData={setJsonBody}
                className="border-t pt-3"
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
  )
}
