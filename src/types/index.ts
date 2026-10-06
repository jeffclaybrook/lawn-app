export type AnalyticsPeriod =
 | "week"
 | "month"
 | "quarter"
 | "year"

export type TransactionItem = {
 type: "revenue" | "expense"
 id: string
 date: Date
 amount: string
 label: string
}

export type MostMowedData = {
 id: string
 name: string
 address: string
 mowingCount: number
}

export type TopCustomersData = {
 id: string
 name: string
 revenue: number
}

export type TransactionData = {
 period: string
 label: string
 revenue: number
 expenses: number
}