import { z } from "zod"

export const createCollectionSchema = z.object({
    title: z.string().min(3).max(255),
    description: z.string().max(255),
    isPublic: z.boolean(),
})

export const collectionIdSchema = z.object({
    id: z.coerce.number(),
})