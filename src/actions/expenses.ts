"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { expenses } from "@/drizzle/schema"
import { getSession } from "@/lib/get-session"
import { expenseSchema, type ExpenseInput } from "@/schema/expense"

export async function createExpense(input: ExpenseInput) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 const data = expenseSchema.parse(input)

 const [expense] = await db
  .insert(expenses)
  .values({
   userId,
   description: data.description,
   amount: data.amount.toFixed(2),
   date: data.date
  })
  .returning()

 revalidatePath("/")
 revalidatePath("/customers")

 return expense
}

export async function updateExpense(
 expenseId: string,
 input: ExpenseInput
) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 const data = expenseSchema.parse(input)

 const [expense] = await db
  .update(expenses)
  .set({
   description: data.description,
   amount: data.amount.toFixed(2),
   date: data.date,
   updatedAt: new Date()
  })
  .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
  .returning()

 if (!expense) {
  throw new Error("Expense not found")
 }

 revalidatePath("/")
 revalidatePath("/expenses")
 revalidatePath(`/expenses/${expenseId}`)

 return expense
}

export async function deleteExpense(expenseId: string) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id
 
 await db
  .delete(expenses)
  .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))

 revalidatePath("/")
 revalidatePath("/expenses")
}