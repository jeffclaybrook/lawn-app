import { z } from "zod"

export const signInSchema = z.object({
 email: z.email({ message: "Invalid email address" }),
 password: z.string().min(3, "Password is required")
})

export type SignInInput = z.infer<typeof signInSchema>