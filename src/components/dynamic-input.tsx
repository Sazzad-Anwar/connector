/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Trash2 } from 'lucide-react'
import {
  FieldArrayMethodProps,
  FieldArrayWithId,
  UseFormReturn,
} from 'react-hook-form'
import { v4 as uuid } from 'uuid'
import { cn } from '../lib/utils'
import { ApiType } from '../types/api'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { TableCell, TableRow } from './ui/table'

type PropsTypes = {
  index: number
  form: UseFormReturn<ApiType, any, undefined>
  propertyName:
    | 'params'
    | 'headers'
    | 'body'
    | 'pathVariables'
    | 'dynamicVariables'
  field: FieldArrayWithId<
    ApiType,
    'params' | 'pathVariables' | 'headers' | 'body' | 'dynamicVariables',
    'id'
  >
  isErrorIndex: (index: number, type: 'value' | 'key') => boolean
  isCorrectVar: (index: number, type: 'value' | 'key') => boolean
  insert: (
    index: number,
    value:
      | {
          id: string
          key: string
          value?: any
          description?: string | undefined
        }
      | {
          id: string
          key: string
          value?: any
          description?: string | undefined
        }[],
    options?: FieldArrayMethodProps | undefined,
  ) => void
  remove: (index?: number | number[] | undefined) => void
}

export default function DynamicInput({
  form,
  propertyName,
  field,
  index,
  insert,
  isCorrectVar,
  isErrorIndex,
  remove,
}: PropsTypes) {
  return (
    <TableRow
      key={field.id}
      className="group border"
    >
      <TableCell className="border-b border-l p-px flex justify-between m-0">
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
        {propertyName === 'body' && (
          <Select
            onValueChange={(value) =>
              form.setValue(
                `${propertyName}.${index}.type`,
                value as 'text' | 'file',
                { shouldDirty: true },
              )
            }
            defaultValue={form.getValues(`${propertyName}.${index}.type`)}
          >
            <SelectTrigger className="w-14 h-7 group-hover:opacity-70 opacity-20 border-none text-xs m-0 mr-1 pr-0">
              <SelectValue
                placeholder="Text"
                className="border-none m-0"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>
        )}
      </TableCell>
      <TableCell className="border p-0">
        <input
          type={
            form.watch(`${propertyName}.${index}.type`) === 'file'
              ? 'file'
              : 'text'
          }
          multiple={true}
          autoComplete="off"
          {...form.register(`${propertyName}.${index}.value` as const)}
          className={cn(
            'h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none',
            isErrorIndex(index, 'value')
              ? 'text-red-500'
              : isCorrectVar(index, 'value')
              ? 'text-cyan-500'
              : 'text-accent-foreground',
            form.watch(`${propertyName}.${index}.type`) === 'file'
              ? ' file:bg-primary-foreground file:border-none file:text-secondary-foreground file:rounded file:m-0 file:py-1 file:mr-2'
              : '',
          )}
          placeholder="Value"
        />
      </TableCell>
      <TableCell className="border border-r-0 p-0">
        <div className="flex items-center justify-between">
          <input
            autoComplete="off"
            {...form.register(`${propertyName}.${index}.description` as const)}
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
  )
}
