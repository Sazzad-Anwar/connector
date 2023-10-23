"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useApiStore from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, MoveRight } from "lucide-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { ApiSchema, ApiType, ParamsType } from "@/types/api"
import {
  cn,
  containsDynamicVariable,
  containsVariable,
  extractVariable,
  getBreadcrumbsForNthChildren,
  getRootParentIdForNthChildren,
  isEmpty,
} from "@/lib/utils"

import { JSONErrorType } from "../api/api"
import MultipleInput from "../multiple-input"
import ResultRender from "../result-render"
import Breadcrumbs from "../sideNav/breadcrumb"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { toast } from "../ui/use-toast"
import InputTabs from "./input-tabs"

export default function UpdateApi() {
  const router = useRouter()
  const params = useParams()
  const folderId = params.folderId as string
  const apiId = params.apiId as string
  const { collections, updateApi, api, getApi } = useApiStore()
  const form = useForm<ApiType>({
    mode: "onChange",
    resolver: zodResolver(ApiSchema),
  })
  let url = form.watch("url")
  const [isUrlError, setIsUrlError] = useState<boolean>(false)
  const rootParentId = getRootParentIdForNthChildren(collections, folderId)
  const rootParent = collections.find((item) => item.id === rootParentId)
  const onSubmit: SubmitHandler<ApiType> = (data) => {
    data.id = api.id
    data.params = isEmpty(data.params!) ? [] : data.params
    data.headers = isEmpty(data.headers!) ? [] : data.headers
    data.body = isEmpty(data.body!) ? [] : data.body

    updateApi(data, api.id)
    toast({
      variant: "success",
      title: "Api is created",
    })
    router.push(`/api/${folderId}/${data.id}`)
  }

  useEffect(() => {
    if (apiId) {
      getApi(apiId)
    }
  }, [apiId, getApi])

  useEffect(() => {
    if (api) {
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
  }, [rootParent, url])

  const setBorderColor = (isError: boolean) =>
    isError ? "border-destructive" : ""

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex items-center px-5 pt-5">
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
                  className={setBorderColor(!!form.formState.errors.name)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="mt-4 flex w-full items-center px-5">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem className="mr-2">
                <Select onValueChange={field.onChange} value={field.value}>
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
                    {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => (
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
                    placeholder="Url"
                    {...field}
                    size={200}
                    value={field.value ?? ""}
                    className={cn(
                      isUrlError ? "text-red-500" : "",
                      setBorderColor(isUrlError)
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
                      <p>{form.formState.errors.url?.message}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormItem>
            )}
          />
        </div>
        <InputTabs form={form} api={api} />
        <div className="mr-5 flex justify-end">
          <Button disabled={isUrlError} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  )
}
