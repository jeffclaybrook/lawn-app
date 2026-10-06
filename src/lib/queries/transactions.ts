import { eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers, expenses, mowings } from "@/drizzle/schema"
import { getSession } from "../get-session"
import type { TransactionItem } from "@/types"

export async function getTransactions(): Promise<TransactionItem[]> {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const revenueRows = await db
  .select({
   id: mowings.id,
   date: mowings.date,
   amount: mowings.amount,
   label: customers.name
  })
  .from(mowings)
  .innerJoin(customers, eq(mowings.customerId, customers.id))
  .where(eq(mowings.userId, userId))

 const expensesRows = await db
  .select({
   id: expenses.id,
   date: expenses.date,
   amount: expenses.amount,
   label: expenses.description
  })
  .from(expenses)
  .where(eq(expenses.userId, userId))

 const combined: TransactionItem[] = [
  ...revenueRows.map((revenue) => ({
   type: "revenue" as const,
   ...revenue
  })),
  ...expensesRows.map((expense) => ({
   type: "expense" as const,
   ...expense
  }))
 ]

 return combined.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export type TransactionListItem = Awaited<ReturnType<typeof getTransactions>>[number]