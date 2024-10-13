/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckSquare, Plus, Square, Trash2 } from 'lucide-react'
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
    | 'formData'
  field: FieldArrayWithId<
    ApiType,
    'params' | 'pathVariables' | 'headers' | 'body' | 'dynamicVariables',
    'id'
  >
  isErrorIndex: (index: number, type: 'value' | 'key') => boolean
  isCorrectVar: (index: number, type: 'value' | 'key') => boolean
  fieldLength: number
  append: (
    value:
      | {
          id: string
          key: string
          value?: any
          isActive: boolean
          description?: string | undefined
        }
      | {
          id: string
          key: string
          value?: any
          isActive: boolean
          description?: string | undefined
        }[],
  ) => void
  insert: (
    index: number,
    value:
      | {
          id: string
          key: string
          value?: any
          isActive: boolean
          description?: string | undefined
        }
      | {
          id: string
          key: string
          value?: any
          isActive: boolean
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
  fieldLength,
  isCorrectVar,
  isErrorIndex,
  remove,
}: PropsTypes) {
  return (
    <TableRow
      key={field.id}
      className="group border-l"
    >
      <TableCell className="border-b-0 group-last:border-b group-last:h-[33.5px] border-t-0 p-px">
        <div className="flex justify-center items-center mx-2">
          {propertyName !== 'pathVariables' &&
          form.watch(`${propertyName}.${index}.key`) ? (
            <label
              htmlFor={`${propertyName}.${index}.isActive`}
              className="cursor-pointer"
            >
              <input
                id={`${propertyName}.${index}.isActive`}
                type="checkbox"
                className="hidden"
                {...form.register(
                  `${propertyName}.${index}.isActive` as const,
                  {
                    value: true,
                  },
                )}
              />
              {form.watch(`${propertyName}.${index}.isActive`) ? (
                <CheckSquare
                  size={18}
                  className="animate__animated animate__fadeIn"
                />
              ) : (
                <Square
                  size={18}
                  className="animate__animated animate__fadeIn text-accent-foreground/50"
                />
              )}
            </label>
          ) : (
            <span className="w-4" />
          )}
        </div>
      </TableCell>
      <TableCell className="border border-r-0 border-b-0 group-last:border-b group-last:h-[33.5px] border-t-0 p-px flex justify-between m-0">
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
              : form.watch(`${propertyName}.${index}.isActive`)
              ? 'dark:text-white text-black'
              : propertyName !== 'pathVariables'
              ? 'dark:text-gray-500 text-gray-400'
              : 'text-accent-foreground',
          )}
          placeholder="Key"
          onInput={() => {
            if (fieldLength === index + 1)
              insert(
                index + 1,
                {
                  id: uuid(),
                  key: '',
                  value: '',
                  isActive: true,
                  description: '',
                },
                {
                  focusIndex: index,
                  focusName: `${propertyName}.${index}.key`,
                },
              )
          }}
        />
        {form.watch('activeBody') === 'form-data' && (
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
            <SelectContent align="end">
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
              ? `text-red-500 ${
                  form.watch(`${propertyName}.${index}.isActive`)
                    ? 'text-opacity-100'
                    : 'text-opacity-30'
                }`
              : isCorrectVar(index, 'value')
              ? `text-cyan-500 ${
                  form.watch(`${propertyName}.${index}.isActive`)
                    ? 'text-opacity-100'
                    : 'text-opacity-30'
                }`
              : form.watch(`${propertyName}.${index}.isActive`)
              ? 'dark:text-white text-black'
              : propertyName !== 'pathVariables'
              ? 'dark:text-gray-500 text-gray-400'
              : 'text-accent-foreground',
            form.watch(`${propertyName}.${index}.type`) === 'file'
              ? ' file:bg-primary-foreground file:border-none file:text-secondary-foreground file:rounded file:m-0 file:py-1 file:mr-2'
              : '',
          )}
          placeholder="Value"
        />
      </TableCell>
      <TableCell className="border p-0">
        <div className="flex items-center justify-between">
          <input
            autoComplete="off"
            {...form.register(`${propertyName}.${index}.description` as const)}
            className={cn(
              'h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none',
              form.watch(`${propertyName}.${index}.isActive`)
                ? 'dark:text-white text-black'
                : propertyName !== 'pathVariables'
                ? 'dark:text-gray-500 text-gray-400'
                : 'text-accent-foreground',
            )}
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
                  isActive: true,
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
