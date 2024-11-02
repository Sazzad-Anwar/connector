import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FaFolder, FaFolderOpen } from 'react-icons/fa'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
const CollectionSchema = z.object({
  collectionName: z.string().min(3, { message: 'Must be 3 characters' }),
})

type PropsType = {
  onSubmit: SubmitHandler<z.infer<typeof CollectionSchema>>
  name?: string
  type?: 'collection' | 'folder'
  actionType: 'create' | 'update'
  className?: string
  isFolderOpen?: boolean
}

export default function CreateFolder({
  name,
  onSubmit,
  type,
  actionType,
  isFolderOpen,
  className = 'flex items-center ml-10 my-1 mr-6',
}: PropsType) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const form = useForm<z.infer<typeof CollectionSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CollectionSchema),
    defaultValues: {
      collectionName: actionType === 'create' ? '' : name,
    },
  })

  const handleSubmit: SubmitHandler<z.infer<typeof CollectionSchema>> = (
    data,
  ) => {
    const updatedData = {
      ...data,
      env: [],
    }
    buttonRef.current?.click()
    form.reset()
    onSubmit(updatedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="collectionName"
          render={({ field }) => (
            <FormItem>
              <FormControl className="mb-0">
                <div className={className}>
                  <div className="size-[18px] mr-2">
                    {isFolderOpen ? (
                      <FaFolderOpen size={18} />
                    ) : (
                      <FaFolder size={18} />
                    )}
                  </div>

                  <Input
                    placeholder={
                      type === 'collection' ? 'Collection name' : 'Folder name'
                    }
                    autoFocus
                    autoComplete="off"
                    className="w-full px-1 text-sm font-semibold h-7 mb-0"
                    {...field}
                    value={field.value ?? ''}
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-16 text-[10px] leading-[10px] pt-0" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
