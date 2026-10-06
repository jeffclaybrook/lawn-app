import { z } from "zod"

export const customerSchema = z.object({
 name: z.string().min(1, "Name is required").max(255),
 address: z.string().min(1, "Address is required").max(255)
})

export type CustomerInput = z.infer<typeof customerSchema>