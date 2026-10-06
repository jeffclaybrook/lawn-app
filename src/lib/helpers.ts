import { addDays, format, parseISO, startOfWeek, startOfYear } from "date-fns"
import { AnalyticsPeriod, TransactionData } from "@/types"

export function formatCurrency(amount: number) {
 return new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
 }).format(amount)
}

export function formatCompactCurrency(amount: number) {
 return new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1
 }).format(amount)
}

export function formatDate(date: Date) {
 return new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
 }).format(date)
}

export function formatCapitalize(value: string) {
 return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatInitials(name: string) {
 if (!name) {
  return null
 }

 return name
  .split(" ")
  .map((part) => part.charAt(0))
  .join("")
}

export function getPeriodStart(
 period: AnalyticsPeriod,
 now: Date = new Date()
): Date {
 const start = new Date(now)

 switch (period) {
  case "week":
   start.setDate(start.getDate() - 7)
   break
  case "month":
   start.setMonth(start.getMonth() - 1)
   break
  case "quarter":
   start.setMonth(start.getMonth() - 3)
   break
  case "year":
   start.setFullYear(start.getFullYear() - 1)
   break
 }

 return start
}

export function toChartData(
 rows: {
  bucket: string
  revenue: number
  expenses: number
 }[],
 period: AnalyticsPeriod
): TransactionData[] {
 const buckets = getYearBuckets(period)

 return buckets.map((bucket) => {
  const row = rows.find((r) => r.bucket === bucket)
  return {
   period: bucket,
   label: formatBucketLabel(bucket, period),
   revenue: row?.revenue ?? 0,
   expenses: row?.expenses ?? 0
  }
 })
}

export function getYearRange(now: Date = new Date()) {
 const start = startOfYear(now)
 const end = new Date(start.getFullYear() + 1, 0, 1)
 return { start, end }
}

export function getBucketKeyFormat(period: AnalyticsPeriod): string {
 switch (period) {
  case "week":
   return "YYYY-MM-DD"
  case "month":
  case "quarter":
   return "YYYY-MM"
  case "year":
   return "YYYY"
 }
}

export function formatBucketLabel(
 bucket: string,
 period: AnalyticsPeriod
): string {
 switch (period) {
  case "week":
   return format(parseISO(`${bucket}`), "MMM d")
  case "month":
   return format(parseISO(`${bucket}-01`), "MMM")
  case "quarter":
   const month = Number(bucket.slice(5, 7))
   const quarter = Math.floor((month - 1) / 3) + 1
   return `Q${quarter}`
  case "year":
   return bucket
 }
}

export function getYearBuckets(
 period: AnalyticsPeriod,
 now: Date = new Date()
): string[] {
 const year = now.getFullYear()

 switch (period) {
  case "year":
   return [String(year)]
  case "quarter":
   return [1, 2, 3, 4].map(
    (q) => `${year}-${String((q - 1) * 3 + 1).padStart(2, "0")}`
   )
  case "month":
   return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
  case "week":
   const buckets: string[] = []
   let cursor = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 1 })

   if (cursor.getFullYear() < year) {
    cursor = addDays(cursor, 7)
   }

   while (cursor.getFullYear() === year) {
    buckets.push(format(cursor, "yyyy-MM-dd"))
    cursor = addDays(cursor, 7)
   }

   return buckets
 }
}