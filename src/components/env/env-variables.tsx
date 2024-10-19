import useApiStore from '@/store/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronsRight, Plus, Trash2 } from 'lucide-react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import { FolderSchema, FolderType } from '@/types/api'

import { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Form } from '../ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { toast } from '../ui/use-toast'

export default function EnvVariables({
  setIsEnvDialogOpen,
  collectionId,
}: {
  setIsEnvDialogOpen: Dispatch<SetStateAction<boolean>>
  collectionId: string
}) {
  // const params = useParams()
  const divRef = useRef<HTMLDivElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const { collections, updateCollection } = useApiStore()
  const collection = collections.find(
    (collection) => collection.id === collectionId,
  )
  const form = useForm<FolderType>({
    mode: 'onChange',
    resolver: zodResolver(FolderSchema),
    defaultValues: {
      ...collection,
    },
  })
  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: 'env',
  })

  useEffect(() => {
    const handleKeyboardPress = (event: KeyboardEvent) => {
      // if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      //   event.preventDefault()
      //   form.handleSubmit(onSubmit)()
      //   setIsEnvDialogOpen(false)
      // }
      if (event.key === 'Escape') {
        // Handle the "Escape" key press here
        if (form.formState.isDirty) {
          if (collection?.env?.length) {
            const env = collection.env
            form.setValue('env', env)
          } else {
            form.setValue('env', [
              {
                id: uuid(),
                key: '',
                value: '',
                description: '',
              },
            ])
          }
          form.reset()
        }
      }
    }

    // Add the event listener when the component mounts
    document.addEventListener('keydown', handleKeyboardPress)

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyboardPress)
    }
  }, [form, collection])

  useEffect(() => {
    if (collection?.env?.length) {
      const env = collection.env
      form.setValue('env', env)
    } else {
      form.setValue('env', [
        {
          id: uuid(),
          key: '',
          value: '',
          description: '',
        },
      ])
    }
  }, [form, collection])

  const onSubmit: SubmitHandler<FolderType> = (data) => {
    const folder = {
      ...collection!,
      type: 'collection' as const,
      env: data.env?.filter((item) => item.key !== '') || [],
    }
    form.setValue('env', folder.env)
    if (collection?.id) {
      updateCollection(folder, collection.id!)
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Variables are saved successfully',
      })
    }
    setIsEnvDialogOpen(false)
  }

  return (
    <section
      className="mt-5"
      ref={divRef}
    >
      <div className="flex items-center">
        <h1 className="text-sm">{collection?.name}</h1>
        <ChevronsRight
          size={13}
          className="mx-2"
        />
        <h1 className="text-sm">Variables</h1>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[calc(100vh-70px)] overflow-auto"
        >
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
                  className="h-[35px] w-[50%] resize-x pl-2 text-accent-foreground"
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
                      autoComplete="off"
                      type="text"
                      {...form.register(`env.${index}.key` as const)}
                      className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                      placeholder="Key"
                    />
                  </TableCell>
                  <TableCell className="border p-0">
                    <input
                      autoComplete="off"
                      {...form.register(`env.${index}.value` as const)}
                      className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                      placeholder="Value"
                    />
                  </TableCell>
                  <TableCell className="border border-r-0 p-0">
                    <input
                      autoComplete="off"
                      {...form.register(`env.${index}.description` as const)}
                      className="h-[30px] w-full rounded-none border-0 bg-transparent pl-2 placeholder:text-accent focus:outline-none"
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell className="group-last:border-b group-last:border-r flex w-full group-last:h-[31.5px] items-center justify-end py-1">
                    <Button
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
                            key: '',
                            value: '',
                            description: '',
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
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => setIsEnvDialogOpen(false)}
              >
                OK
              </Button>
              <Button
                disabled={!form.formState.isDirty}
                ref={submitButtonRef}
                type="submit"
                size="sm"
                className="mt-5 ml-5"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  )
}
