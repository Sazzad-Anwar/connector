import * as z from "zod"

export type FolderType = {
  id: string
  name: string
  type: "collection" | "folder"
  apis?: ApiType[]
  isOpen?: boolean
  children?: FolderType[]
  env?: EnvVariableType[]
}

const ParamsSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.any(),
  description: z.string().optional(),
})

export const ApiSchema = z.object({
  name: z.string().min(3, { message: "Name must be bigger than 3 characters" }),
  url: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  params: z.array(ParamsSchema).optional(),
  pathVariables: z.array(ParamsSchema).optional(),
  headers: z.array(ParamsSchema).optional(),
  body: z.array(ParamsSchema).optional(),
})

export type ApiType = z.infer<typeof ApiSchema> & { id: string }
export type ParamsType = z.infer<typeof ParamsSchema> & { id: string }

export type EnvVariableType = {
  variable: string
  value: string
}
