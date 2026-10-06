import { and, desc, eq, gte, lt, sql } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers, expenses, mowings } from "@/drizzle/schema"
import type { AnalyticsPeriod } from "@/types"
import { getSession } from "../get-session"
import { getPeriodStart, getYearRange, getBucketKeyFormat } from "../helpers"

export async function getRevenueVsExpenses(period: AnalyticsPeriod) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const unitSql = sql.raw(`'${period}'`)
 const format = getBucketKeyFormat(period)
 const { start, end } = getYearRange()

 const revenueByBucket = await db
  .select({
   bucket: sql<string>`to_char(date_trunc(${unitSql}, ${mowings.date}), ${format})`,
   total: sql<string>`sum(${mowings.amount})`
  })
  .from(mowings)
  .where(and(eq(mowings.userId, userId), gte(mowings.date, start), lt(mowings.date, end)))
  .groupBy(sql`date_trunc(${unitSql}, ${mowings.date})`)
  .orderBy(sql`date_trunc(${unitSql}, ${mowings.date})`)

 const expensesByBucket = await db
  .select({
   bucket: sql<string>`to_char(date_trunc(${unitSql}, ${expenses.date}), ${format})`,
   total: sql<string>`sum(${expenses.amount})`
  })
  .from(expenses)
  .where(and(eq(expenses.userId, userId), gte(expenses.date, start), lt(expenses.date, end)))
  .groupBy(sql`date_trunc(${unitSql}, ${expenses.date})`)
  .orderBy(sql`date_trunc(${unitSql}, ${expenses.date})`)

 const buckets = new Set([
  ...revenueByBucket.map((revenue) => revenue.bucket),
  ...expensesByBucket.map((expense) => expense.bucket)
 ])

 return Array.from(buckets)
  .sort()
  .map((bucket) => ({
   bucket,
   revenue: Number(revenueByBucket.find((revenue) => revenue.bucket === bucket)?.total ?? 0),
   expenses: Number(expensesByBucket.find((expense) => expense.bucket === bucket)?.total ?? 0)
  }))
}

export async function getTopCustomersByRevenue() {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 return db
  .select({
   customerId: customers.id,
   customerName: customers.name,
   totalRevenue: sql<string>`sum(${mowings.amount})`,
   mowingCount: sql<number>`count(${mowings.id})::int`
  })
  .from(mowings)
  .innerJoin(customers, eq(mowings.customerId, customers.id))
  .where(and(eq(mowings.userId, userId)))
  .groupBy(customers.id)
  .orderBy(desc(sql`sum(${mowings.amount})`))
}

export async function getMostMowedLawns() {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 return db
  .select({
   customerId: customers.id,
   customerName: customers.name,
   customerAddress: customers.address,
   mowingCount: sql<number>`count(${mowings.id})::int`
  })
  .from(mowings)
  .innerJoin(customers, eq(mowings.customerId, customers.id))
  .where(and(eq(mowings.userId, userId)))
  .groupBy(customers.id)
  .orderBy(desc(sql`count(${mowings.id})`))
}

export async function getSummaryTotals(period: AnalyticsPeriod) {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const start = getPeriodStart(period)

 const [revenueRow] = await db
  .select({
   total: sql<string>`coalesce(sum(${mowings.amount}), 0)`
  })
  .from(mowings)
  .where(and(eq(mowings.userId, userId), gte(mowings.date, start)))

 const [expenseRow] = await db
  .select({
   total: sql<string>`coalesce(sum(${expenses.amount}), 0)`
  })
  .from(expenses)
  .where(and(eq(expenses.userId, userId), gte(expenses.date, start)))

 const totalRevenue = Number(revenueRow?.total ?? 0)
 const totalExpenses = Number(expenseRow?.total ?? 0)

 return {
  totalRevenue,
  totalExpenses,
  netProfit: totalRevenue - totalExpenses
 }
}