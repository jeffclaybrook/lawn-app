import { z } from "zod"

export const mowingSchema = z.object({
 customerId: z.uuid("Select a customer"),
 amount: z.coerce.number().positive("Amount must be greater than 0"),
 date: z.coerce.date()
})

export type MowingInput = z.infer<typeof mowingSchema>