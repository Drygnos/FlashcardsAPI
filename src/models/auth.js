import { z } from "zod"

export const registerSchema = z.object({
    email: z.email(),
    name : z.string().min(1).max(255),
    lastName : z.string().min(1).max(255),
    password: z.string().min(8).max(255),

})

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(255),
})