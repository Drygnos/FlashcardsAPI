import { z } from "zod"

export const createFlashcardSchema = z.object({
    recto: z.string().min(1).max(300),
    verso: z.string().min(1).max(300),
    rectoUrl: z.string().min(1).max(300),
    versoUrl: z.string().min(1).max(300),
    idCollection: z.uuid(),
})