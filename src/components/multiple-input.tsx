import useApiStore from '@/store/store'
import { useEffect } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import { containsDynamicVariable, containsVariable } from '@/lib/utils'
import { ApiType } from '@/types/api'

import { useParams } from 'react-router-dom'
import DynamicInput from './dynamic-input'
import { Table, TableBody, TableHead, TableHeader, TableRow } from './ui/table'

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
        type: 'text',
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
          <DynamicInput
            index={index}
            form={form}
            propertyName={propertyName}
            key={index}
            field={field}
            insert={insert}
            remove={remove}
            isErrorIndex={isErrorIndex}
            isCorrectVar={isCorrectVar}
          />
        ))}
      </TableBody>
    </Table>
  )
}
