import { and, eq, desc } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { expenses } from "@/drizzle/schema"
import { getSession } from "../get-session"

export async function getExpenses() {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 return db
  .select()
  .from(expenses)
  .where(eq(expenses.userId, userId))
  .orderBy(desc(expenses.date))
}

export async function getExpense(expenseId: string) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const [expense] = await db
  .select()
  .from(expenses)
  .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))

 if (!expense) {
  throw new Error("Expense not found")
 }

 return expense
}

export type ExpenseListItem = Awaited<ReturnType<typeof getExpenses>>[number]