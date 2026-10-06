import { z } from "zod"

export const expenseSchema = z.object({
 description: z.string().min(1, "Description is required").max(255),
 amount: z.coerce.number().positive("Amount must be greater than 0"),
 date: z.coerce.date()
})

export type ExpenseInput = z.infer<typeof expenseSchema>