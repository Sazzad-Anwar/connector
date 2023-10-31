import useApiStore from '@/store/store'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import { cn, containsDynamicVariable, containsVariable } from '@/lib/utils'
import { ApiType } from '@/types/api'

import { useParams } from 'react-router-dom'
import { Button } from './ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

export type PropsType = {
  propertyName:
    | 'params'
    | 'headers'
    | 'body'
    | 'pathVariables'
    | 'dynamicVariables'
  form: UseFormReturn<ApiType, any, undefined>
}

export default function MultipleInput({ form, propertyName }: PropsType) {
  const { env, getEnv } = useApiStore()
  const routeParams = useParams()
  const { fields, insert, append, remove } = useFieldArray({
    control: form.control,
    name: propertyName,
  })
  const folderId = routeParams?.folderId
  const params = form.watch(propertyName)

  useEffect(() => {
    if (folderId) {
      getEnv(folderId)
    }
  }, [getEnv, folderId])

  useEffect(() => {
    if (fields.length < 1) {
      append({
        id: uuid(),
        key: '',
        value: '',
        description: '',
      })
    }
  }, [fields, append])

  const isErrorIndex = (index: number, type: 'value' | 'key') => {
    const items = params?.filter(
      (item) =>
        (type === 'value' ? item.value : item.key) !== '' &&
        containsDynamicVariable(type === 'value' ? item.value : item.key) &&
        !containsVariable(type === 'value' ? item.value : item.key, env),
    )

    const indexArr: number[] = []

    items?.map((item) => {
      indexArr.push(params!.indexOf(item)!)
    })

    if (indexArr.includes(index)) {
      return true
    } else {
      return false
    }
  }

  const isCorrectVar = (index: number, type: 'value' | 'key') => {
    const items = params?.filter(
      (item) =>
        (type === 'value' ? item.value : item.key) !== '' &&
        containsDynamicVariable(type === 'value' ? item.value : item.key) &&
        containsVariable(type === 'value' ? item.value : item.key, env),
    )

    const indexArr: number[] = []

    items?.map((item) => {
      indexArr.push(params!.indexOf(item)!)
    })

    if (indexArr.includes(index)) {
      return true
    } else {
      return false
    }
  }

  return (
    <Table className="overflow-auto max-h-[calc(100vh-300px)]">
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
          <TableRow
            key={field.id}
            className="group border"
          >
            <TableCell className="border p-0">
              <input
                disabled={propertyName === 'pathVariables'}
                autoComplete="off"
                type="text"
                {...form.register(`${propertyName}.${index}.key` as const)}
                className={cn(
                  'h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none',
                  isErrorIndex(index, 'key')
                    ? 'text-red-500'
                    : isCorrectVar(index, 'key')
                    ? 'text-cyan-500'
                    : 'text-accent-foreground',
                )}
                placeholder="Key"
              />
            </TableCell>
            <TableCell className="border p-0">
              <input
                autoComplete="off"
                {...form.register(`${propertyName}.${index}.value` as const)}
                className={cn(
                  'h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none',
                  isErrorIndex(index, 'value')
                    ? 'text-red-500'
                    : isCorrectVar(index, 'value')
                    ? 'text-cyan-500'
                    : 'text-accent-foreground',
                )}
                placeholder="Value"
              />
            </TableCell>
            <TableCell className="border border-r-0 p-0">
              <div className="flex items-center justify-between">
                <input
                  autoComplete="off"
                  {...form.register(
                    `${propertyName}.${index}.description` as const,
                  )}
                  className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                  placeholder="Description"
                />

                <div className="flex items-center">
                  <Button
                    disabled={propertyName === 'pathVariables'}
                    onClick={() =>
                      insert(index + 1, {
                        id: uuid(),
                        key: '',
                        value: '',
                        description: '',
                      })
                    }
                    variant="ghost"
                    size="xs"
                    type="button"
                    className={cn(
                      'mr-1 px-1 opacity-20 transition-all duration-300 ease-linear group-hover:opacity-100',
                      propertyName === 'pathVariables' ? 'hidden' : 'block',
                    )}
                  >
                    <Plus size={16} />
                  </Button>
                  <Button
                    disabled={propertyName === 'pathVariables'}
                    onClick={() => remove(index)}
                    variant="ghost"
                    size="xs"
                    type="button"
                    className={cn(
                      'mr-1 px-1 opacity-20 transition-all duration-300 ease-linear group-hover:opacity-100',
                      propertyName === 'pathVariables' ? 'hidden' : 'block',
                    )}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
