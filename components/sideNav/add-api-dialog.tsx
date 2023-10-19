import React, { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import useApiStore from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoveRight } from "lucide-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { ApiSchema, ApiType } from "@/types/api"
import { getBreadcrumbsForNthChildren } from "@/lib/utils"

import MultipleInput from "../MultipleInput"
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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const form = useForm<ApiType>({
    mode: "onSubmit",
    resolver: zodResolver(ApiSchema),
  })

  const onSubmit: SubmitHandler<ApiType> = (data) => {
    if (details?.id) {
      data.id = details.id
    }

    buttonRef.current?.click()
    onCreateApi(data)
    form.reset()
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
                  <FormItem>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="Url"
                        {...field}
                        size={200}
                        value={field.value ?? ""}
                        className={setBorderColor(!!form.formState.errors.url)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="my-3 flex items-center">
              <Tabs defaultValue="params" className="w-full">
                <TabsList className="">
                  <TabsTrigger value="params">Params</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>
                {["params", "headers", "body"].map((tab) => (
                  <TabsContent
                    key={tab}
                    value={tab}
                    className="animate__animated animate__fadeIn relative max-h-96 overflow-auto border-y"
                  >
                    <MultipleInput propertyName={tab as any} form={form} />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel
                ref={buttonRef}
                onClick={() =>
                  folderId
                    ? router.push(`/api/${folderId}/${details?.id}`)
                    : null
                }
              >
                Cancel
              </AlertDialogCancel>
              <Button type="submit" variant="outline" className="bg-postman">
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
