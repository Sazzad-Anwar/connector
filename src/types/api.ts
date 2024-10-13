import * as z from 'zod'

export const CollectionSchema = z.object({
  collectionName: z
    .string()
    .min(3, { message: 'Collection name should be more than 3 characters' }),
})

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
  url: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  params: z.array(ParamsSchema).optional(),
  pathVariables: z.array(ParamsSchema).optional(),
  headers: z.array(ParamsSchema).optional(),
  body: z.array(ParamsSchema).optional(),
  formData: z.array(ParamsSchema).optional(),
  dynamicVariables: z.array(ParamsSchema).optional(),
  jsonBody: z.any().optional(),
  interactiveQuery: z.any().optional(),
  activeBody: z.enum(['x-form-urlencoded', 'json', 'form-data']).optional(),
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
export type ParamsType = z.infer<typeof ParamsSchema>
export type FolderType = z.infer<typeof FolderSchema> & {
  type: 'collection' | 'folder'
  id: string
  name: string
  apis?: ApiType[]
  isOpen?: boolean
  children?: FolderType[]
}

export const FolderParsingSchema: z.ZodSchema = z.lazy(() =>
  z.object({
    name: z
      .string()
      .min(3, { message: 'Folder name should be more than 3 characters' }),
    type: z.enum(['collection', 'folder']),
    isOpen: z.boolean().optional(),
    id: z.string().uuid(),
    children: z.array(FolderParsingSchema).optional(), // Recursive reference
  }),
)

export const CollectionParsingSchema: z.ZodSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Collection name should be more than 3 characters' }),
  type: z.enum(['collection', 'folder']),
  isOpen: z.boolean().optional(),
  id: z.string().uuid(),
  env: z.array(ParamsSchema).optional(),
  apis: z.array(ApiSchema).optional(),
  children: z.array(FolderParsingSchema).optional(), // Reference the FolderParsingSchema
})

export type TabType = {
  folderId: string
  id: string
  name: string
}

export type CookieType = {
  customKey?: string
  customValue?: string
  maxAge?: string | boolean
  expires?: string
  path?: string | boolean
  secure?: string | boolean
  httpOnly?: string | boolean
  sameSite?: string | boolean
}
