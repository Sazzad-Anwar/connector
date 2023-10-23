import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import useApiStore from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, MoveRight } from "lucide-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { ApiSchema, ApiType, ParamsType } from "@/types/api"
import {
  containsDynamicVariable,
  containsVariable,
  extractVariable,
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
} from "@/lib/utils"

import { JSONErrorType } from "../api/api"
import MultipleInput from "../multiple-input"
import ResultRender from "../result-render"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem } from "../ui/form"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import Breadcrumbs from "./breadcrumb"

type PropsType = {
  details?: ApiType
  folderId: string
  children: React.ReactNode
  onCreateApi: SubmitHandler<ApiType>
}

export default function AddApiDialog({
  children,
  folderId,
  onCreateApi,
  details,
}: PropsType) {
  const router = useRouter()
  const { collections } = useApiStore()
  let [jsonBodyData, setJsonBodyData] = useState<any>({})
  let [jsonError, setJsonError] = useState<JSONErrorType>()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const form = useForm<ApiType>({
    mode: "onSubmit",
    criteriaMode: "all",
    resolver: zodResolver(ApiSchema),
  })
  let url = form.watch("url")
  const rootParentId = getRootParentIdForNthChildren(collections, folderId)
  const rootParent = collections.find((item) => item.id === rootParentId)

  const onSubmit: SubmitHandler<ApiType> = (data) => {
    if (details?.id) {
      data.id = details.id
    }

    buttonRef.current?.click()
    onCreateApi(data)
    form.reset()
  }

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
    form.setValue("id", details?.id ?? "")
    form.setValue("name", details?.name ?? "")
    form.setValue("method", details?.method ?? "GET")
    form.setValue("url", details?.url ?? "")
    form.setValue(
      "params",
      details?.params?.length
        ? details?.params
        : [{ id: uuid(), key: "", value: "", description: "" }]
    )
    form.setValue(
      "headers",
      details?.headers?.length
        ? details?.headers
        : [{ id: uuid(), key: "", value: "", description: "" }]
    )
    form.setValue(
      "body",
      details?.body?.length
        ? details?.body
        : [{ id: uuid(), key: "", value: "", description: "" }]
    )
  }, [form, details])

  useEffect(() => {
    if (
      containsDynamicVariable(url) &&
      !containsVariable(url, rootParent?.env ?? [])
    ) {
      form.setError("url", {
        type: "pattern",
        message: `${extractVariable(url)} is not a saved variable`,
      })
    } else {
      form.clearErrors()
    }
  }, [form, url, rootParent])

  const setBorderColor = (isError: boolean) =>
    isError ? "border-destructive" : ""

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center truncate">
                      <Breadcrumbs
                        breadcrumbs={getBreadcrumbsForNthChildren(
                          collections,
                          folderId
                        )}
                      />
                      <MoveRight size={13} className="mx-2" />
                      <FormControl>
                        <Input
                          placeholder="Api Name"
                          {...field}
                          value={field.value ?? ""}
                          className={setBorderColor(
                            !!form.formState.errors.name
                          )}
                        />
                      </FormControl>
                    </AlertDialogTitle>
                  </AlertDialogHeader>
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={
                            (field.value === "GET"
                              ? "text-green-500"
                              : field.value === "POST"
                                ? "text-yellow-500"
                                : field.value === "PUT"
                                  ? "text-blue-500"
                                  : field.value === "PATCH"
                                    ? "text-purple-500"
                                    : field.value === "DELETE"
                                      ? "text-destructive"
                                      : "text-foreground") +
                            " font-bold w-24 " +
                            setBorderColor(!!form.formState.errors.method)
                          }
                        >
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["GET", "POST", "PUT", "PATCH", "DELETE"].map(
                          (item) => (
                            <SelectItem
                              className={
                                (item === "GET"
                                  ? "text-green-500"
                                  : item === "POST"
                                    ? "text-yellow-500"
                                    : item === "PUT"
                                      ? "text-blue-500"
                                      : item === "PATCH"
                                        ? "text-purple-500"
                                        : "text-destructive") + " font-bold"
                              }
                              key={item}
                              value={item}
                            >
                              {item}
                            </SelectItem>
                          )
                        )}
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
                        placeholder="Url"
                        {...field}
                        size={200}
                        value={field.value ?? ""}
                        className={setBorderColor(!!form.formState.errors.url)}
                      />
                    </FormControl>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {form.formState.errors.url && (
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
            <div className="my-3 flex items-center">
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
                      <TabsTrigger
                        value="x-www-form-urlencoded"
                        className="h-7"
                      >
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
                        height={150}
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
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel
                ref={buttonRef}
                onClick={() => {
                  folderId && details?.id
                    ? router.push(`/api/${folderId}/${details?.id}`)
                    : null
                  form.reset()
                }}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                disabled={!!form.formState.errors.url?.message}
                type="submit"
                variant="outline"
                className="bg-postman"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
