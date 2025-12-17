import { z } from "zod"

export const createCollectionSchema = z.object({
    title: text('title').notNull(),
    description: text('description').notNull(),
    isPublic: integer('is_public', { mode: 'boolean' }).notNull(),
})

export const collectionIdSchema = z.object({
    id: z.uuid()
})