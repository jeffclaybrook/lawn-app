import { and, desc, eq, gte, lt, sql } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { customers, expenses, mowings } from "@/drizzle/schema"
import type { AnalyticsPeriod, SummaryByPeriodRow } from "@/types"
import { getSession } from "../get-session"
import { getYearRange, getBucketKeyFormat } from "../helpers"

const MONTH_LABELS = [
 "Jan", "Feb", "Mar", "Apr", "May", "Jun",
 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

type DateColumn = typeof mowings.date | typeof expenses.date
type UserIdColumn = typeof mowings.userId | typeof expenses.userId

function bucketExpr(
 period: AnalyticsPeriod,
 dateColumn: DateColumn
) {
 switch (period) {
  case "week":
   return sql<number>`floor((extract(doy from ${dateColumn}) - 1) / 7) + 1`
  case "month":
   return sql<number>`extract(month from ${dateColumn})`
  case "quarter":
   return sql<number>`extract(quarter from ${dateColumn})`
  case "year":
   return sql<number>`extract(year from ${dateColumn})`
 }
}

function whereForPeriod(
 period: AnalyticsPeriod,
 dateColumn: DateColumn,
 userIdColumn: UserIdColumn,
 userId: string,
 currentYear: number
) {
 if (period === "year") {
  return eq(userIdColumn, userId)
 }

 return and(eq(userIdColumn, userId), sql`extract(year from ${dateColumn}) = ${currentYear}`)
}

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

export async function getSummaryByPeriod(period: AnalyticsPeriod): Promise<SummaryByPeriodRow[]> {
 const session = await getSession()

 if (!session) {
  throw new Error("Unauthorized")
 }

 const userId = session.user.id

 const currentYear = new Date().getFullYear()

 const revenueBucket = bucketExpr(period, mowings.date)
 const expenseBucket = bucketExpr(period, expenses.date)

 const [revenueRows, expenseRows] = await Promise.all([
  db
   .select({
    bucket: revenueBucket,
    total: sql<string>`coalesce(sum(${mowings.amount}), 0)`
   })
   .from(mowings)
   .where(whereForPeriod(period, mowings.date, mowings.userId, userId, currentYear))
   .groupBy(revenueBucket),
  db
   .select({
    bucket: expenseBucket,
    total: sql<string>`coalesce(sum(${expenses.amount}), 0)`
   })
   .from(expenses)
   .where(whereForPeriod(period, expenses.date, expenses.userId, userId, currentYear))
   .groupBy(expenseBucket),
 ])

 const revenueByBucket = new Map(revenueRows.map((row) => [Number(row.bucket), Number(row.total)]))
 const expensesByBucket = new Map(expenseRows.map((row) => [Number(row.bucket), Number(row.total)]))

 if (period === "year") {
  const years = new Set<number>([currentYear, ...revenueByBucket.keys(), ...expensesByBucket.keys()])

  return Array.from(years)
   .sort((a, b) => a - b)
   .map((year) => {
    const totalRevenue = revenueByBucket.get(year) ?? 0
    const totalExpenses = expensesByBucket.get(year) ?? 0

    return {
      key: `${year}`,
      label: `${year}`,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    }
   })
 }

 const today = new Date()
 const dayOfYear = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(today.getFullYear(), 0, 1)) / 86_400_000) + 1

 const unitsSoFar =
  period === "week" ? Math.ceil(dayOfYear / 7)
   : period === "month" ? today.getMonth() + 1
   : Math.floor(today.getMonth() / 3) + 1

 return Array.from({ length: unitsSoFar }, (_, i) => {
  const n = i + 1
  const totalRevenue = revenueByBucket.get(n) ?? 0
  const totalExpenses = expensesByBucket.get(n) ?? 0

  return {
    key: `${currentYear}-${period}-${n}`,
    label: period === "week" ? `Week ${n}` : period === "month" ? MONTH_LABELS[n - 1] : `Q${n}`,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
  }
 })
}