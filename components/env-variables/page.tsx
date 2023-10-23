"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import useApiStore from "@/store/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { MoveRight, Plus, Trash2 } from "lucide-react"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { v4 as uuid } from "uuid"

import { FolderSchema, FolderType, ParamsType } from "@/types/api"

import SidenavToggler from "../sidenav-toggler"
import { Button } from "../ui/button"
import { Form } from "../ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { toast } from "../ui/use-toast"

export default function EnvVariables() {
  const params = useParams()
  const { collections, updateFolder } = useApiStore()
  const collection = collections.find(
    (collection) => collection.id === params.collectionId
  )!
  const form = useForm<FolderType>({
    mode: "onChange",
    resolver: zodResolver(FolderSchema),
    defaultValues: {
      env:
        collection?.id && collection?.env?.length
          ? collection?.env
          : [
            {
              id: uuid(),
              key: "",
              value: "",
              description: "",
            },
          ],
    },
  })
  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "env",
  })

  const onSubmnt: SubmitHandler<FolderType> = (data) => {
    let folder = {
      ...collection,
      env: data.env?.filter((item) => item.key !== ""),
    }
    updateFolder(folder, collection?.id)

    toast({
      variant: "success",
      title: "Variables are saved",
    })
  }

  return (
    <section className="p-5">
      <div className="flex items-center">
        <SidenavToggler />
        <h1 className="ml-5 text-base lg:text-lg xl:text-xl">
          {collection?.name}
        </h1>
        <MoveRight size={13} className="mx-2" />
        <h1 className="text-base lg:text-lg xl:text-xl">Variables</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmnt)}>
          <Table className="animate__animated animate__fadeIn mt-5 w-full">
            <TableHeader>
              <TableRow className="border">
                <TableHead className="h-[35px] w-[30%] resize-x border pl-2 text-accent-foreground">
                  Key
                </TableHead>
                <TableHead className="h-[35px] w-[30%] resize-x border pl-2 text-accent-foreground">
                  Value
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="h-[35px] w-[40%] resize-x pl-2 text-accent-foreground"
                >
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} className="group border">
                  <TableCell className="border p-0">
                    <input
                      type="text"
                      {...form.register(`env.${index}.key` as const)}
                      className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                      placeholder="Key"
                    />
                  </TableCell>
                  <TableCell className="border p-0">
                    <input
                      {...form.register(`env.${index}.value` as const)}
                      className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                      placeholder="Value"
                    />
                  </TableCell>
                  <TableCell className="border border-r-0 p-0">
                    <input
                      {...form.register(`env.${index}.description` as const)}
                      className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell className="flex h-[30px] w-full items-center justify-end py-1">
                    <Button
                      onClick={() =>
                        insert(index + 1, {
                          id: uuid(),
                          key: "",
                          value: "",
                          description: "",
                        })
                      }
                      variant="ghost"
                      size="xs"
                      type="button"
                      className="mr-1 px-1 opacity-20 transition-all duration-300 ease-linear group-hover:opacity-100"
                    >
                      <Plus size={16} />
                    </Button>
                    <Button
                      onClick={() => {
                        remove(index)
                        if (index === 0) {
                          insert(1, {
                            id: uuid(),
                            key: "",
                            value: "",
                            description: "",
                          })
                        }
                      }}
                      variant="ghost"
                      size="xs"
                      type="button"
                      className="mr-1 px-1 opacity-20 transition-all duration-300 ease-linear group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="ml-auto mt-5 flex justify-self-end"
          >
            Save
          </Button>
        </form>
      </Form>
    </section>
  )
}
