"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatCurrency, formatCompactCurrency } from "@/lib/helpers"
import type { AnalyticsPeriod, TransactionData } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type TransactionsChartProps = {
 weekly: TransactionData[]
 monthly: TransactionData[]
 quarterly: TransactionData[]
 yearly: TransactionData[]
}

const chartConfig = {
 revenue: {
  label: "Revenue",
  color: "var(--chart-1)"
 },
 expenses: {
  label: "Expenses",
  color: "var(--chart-2)"
 }
} satisfies ChartConfig

export function TransactionsChart({
 weekly,
 monthly,
 quarterly,
 yearly
}: TransactionsChartProps) {
 const [period, setPeriod] = useState<AnalyticsPeriod>("month")

 const data = {
  week: weekly,
  month: monthly,
  quarter: quarterly,
  year: yearly
 }[period]

 return (
  <Card>
   <CardHeader className="flex flex-row items-center justify-between">
    <div>
     <CardTitle>Transactions</CardTitle>
     <CardDescription>Revenue and expenses</CardDescription>
    </div>
    <Select
     value={period}
     onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
    >
     <SelectTrigger className="w-[140px]">
      <SelectValue />
     </SelectTrigger>
     <SelectContent position="popper">
      <SelectItem value="week">Weekly</SelectItem>
      <SelectItem value="month">Monthly</SelectItem>
      <SelectItem value="quarter">Quarterly</SelectItem>
      <SelectItem value="year">Yearly</SelectItem>
     </SelectContent>
    </Select>
   </CardHeader>
   <CardContent>
    <ChartContainer
     config={chartConfig}
     className="min-h-[350px] max-h-[450px] w-full"
    >
     <BarChart
      accessibilityLayer
      data={data}
      margin={{
       left: 12,
       right: 12
      }}
     >
      <CartesianGrid vertical={false} />
      <XAxis
       dataKey="label"
       tickLine={false}
       axisLine={false}
       tickMargin={8}
      />
      <YAxis
       tickLine={false}
       axisLine={false}
       tickFormatter={formatCompactCurrency}
      />
      <Bar
       dataKey="revenue"
       fill="var(--color-revenue)"
       radius={4}
      />
      <Bar
       dataKey="expenses"
       fill="var(--color-expenses)"
       radius={4}
      />
      <ChartTooltip
       cursor={false}
       content={
        <ChartTooltipContent
         indicator="dot"
         formatter={(value) => formatCurrency(Number(value))}
        />
       }
      />
      <ChartLegend content={<ChartLegendContent />} />
     </BarChart>
    </ChartContainer>
   </CardContent>
  </Card>
 )
}