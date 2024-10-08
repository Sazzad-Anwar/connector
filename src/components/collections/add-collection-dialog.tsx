import { zodResolver } from '@hookform/resolvers/zod'
import React, { useRef } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'

import { CollectionSchema } from '../../types/api'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Button, buttonVariants } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'

type PropsType = {
  children: React.ReactNode
  onSubmit: SubmitHandler<z.infer<typeof CollectionSchema>>
  name?: string
  type?: 'collection' | 'folder'
}

export default function AddCollectionDialog({
  children,
  name,
  onSubmit,
  type,
}: PropsType) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const form = useForm<z.infer<typeof CollectionSchema>>({
    mode: 'onChange',
    resolver: zodResolver(CollectionSchema),
    defaultValues: {
      collectionName: name,
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
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="collectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === 'collection' ? 'Collection' : 'Folder'} Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      autoComplete="off"
                      placeholder={
                        type === 'collection'
                          ? 'Collection name'
                          : 'Folder name'
                      }
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="mt-5">
              <AlertDialogCancel
                ref={buttonRef}
                type="button"
                className={buttonVariants({ size: 'xs', variant: 'outline' })}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                size="xs"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
