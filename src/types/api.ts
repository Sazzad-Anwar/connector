import * as z from 'zod'

export const ParamsSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.any(),
  isActive: z.boolean().optional(),
  type: z.enum(['text', 'file']).optional(),
  description: z.string().optional(),
})

export const ApiSchema = z.object({
  name: z.string().min(3, { message: 'Name must be bigger than 3 characters' }),
  url: z.string().nonempty(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  params: z.array(ParamsSchema).optional(),
  pathVariables: z.array(ParamsSchema).optional(),
  headers: z.array(ParamsSchema).optional(),
  body: z.array(ParamsSchema).optional(),
  dynamicVariables: z.array(ParamsSchema).optional(),
  jsonBody: z.any().optional(),
  interactiveQuery: z.any().optional(),
  activeBody: z.enum(['x-form-urlencoded', 'json']).optional(),
  activeQuery: z
    .enum(['interactive-query', 'query-params', 'url-params'])
    .optional(),
})

export const FolderSchema = z.object({
  env: z.array(ParamsSchema).optional(),
})

export type ApiType = z.infer<typeof ApiSchema> & {
  id: string
  response?: string
  responseStatus?: string
}
export type ParamsType = z.infer<typeof ParamsSchema> & { id: string }
export type FolderType = z.infer<typeof FolderSchema> & {
  type: 'collection' | 'folder'
  id: string
  name: string
  apis?: ApiType[]
  isOpen?: boolean
  children?: FolderType[]
}
