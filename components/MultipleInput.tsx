"use client"

import React, { useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useFieldArray } from "react-hook-form"
import { v4 as uuid } from "uuid"

import Loading from "@/app/loading"

import { PropsType } from "./multiple-input"
import { Button } from "./ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

export default function MultipleInput({ form, propertyName }: PropsType) {
  const { fields, insert, append, remove } = useFieldArray({
    control: form.control,
    name: propertyName,
  })

  useEffect(() => {
    if (fields.length < 1) {
      append({
        id: uuid(),
        key: "",
        value: "",
        description: "",
      })
    }
  }, [fields, append])

  if (fields.length < 1) {
    return null
  }

  return (
    <Table className="relative block h-52 w-full border-collapse">
      <TableHeader className="sticky -top-1 bg-background">
        <TableRow>
          <TableHead className="h-[35px] w-[30%] resize-x border pl-2 text-accent-foreground">
            Key
          </TableHead>
          <TableHead className="h-[35px] w-[30%] resize-x border pl-2 text-accent-foreground">
            Value
          </TableHead>
          <TableHead
            colSpan={2}
            className="h-[35px] w-[40%] resize-x border pl-2 text-accent-foreground"
          >
            Description
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {fields.map((field, index) => (
          <TableRow key={field.id} className="group">
            <TableCell className="w-1/4 border p-0">
              <input
                type="text"
                {...form.register(`${propertyName}.${index}.key` as const)}
                className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                placeholder="Key"
              />
            </TableCell>
            <TableCell className="w-1/4 border p-0">
              <input
                {...form.register(`${propertyName}.${index}.value` as const)}
                className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                placeholder="Value"
              />
            </TableCell>
            <TableCell className="w-2/4 border border-r-0 p-0 group-hover:border">
              <input
                {...form.register(
                  `${propertyName}.${index}.description` as const
                )}
                className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                placeholder="Description"
              />
            </TableCell>
            <TableCell className="flex h-[33.5px] items-center border-y-0 border-l-0 border-r">
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
                className="mr-1 px-1 opacity-0 transition-all duration-300 ease-linear group-hover:opacity-100"
              >
                <Plus size={16} />
              </Button>
              <Button
                onClick={() => remove(index)}
                variant="ghost"
                size="xs"
                type="button"
                className="mr-1 px-1 opacity-0 transition-all duration-300 ease-linear group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
