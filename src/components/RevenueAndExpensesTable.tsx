"use client"

import { useState, useTransition } from "react"
import { formatCurrency } from "@/lib/helpers"
import { cn } from "@/lib/utils"
import { getSummaryByPeriod } from "@/lib/queries/analytics"
import type { AnalyticsPeriod, SummaryByPeriodRow } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { EmptyStateIcon } from "./Icons"

type RevenueAndExpensesTableProps = {
 initialPeriod: AnalyticsPeriod
 initialRows: SummaryByPeriodRow[]
}

export function RevenueAndExpensesTable({
 initialPeriod,
 initialRows
}: RevenueAndExpensesTableProps) {
 const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod)
 const [rows, setRows] = useState<SummaryByPeriodRow[]>(initialRows)
 const [isPending, startTransition] = useTransition()

 const handlePeriodChange = (value: AnalyticsPeriod) => {
  setPeriod(value)
  startTransition(async () => {
   const nextRows = await getSummaryByPeriod(value)
   setRows(nextRows)
  })
 }

 const data = []

 return (
  <Card>
   <CardHeader className="flex flex-row items-center justify-between">
    <div>
     <CardTitle>Revenue and expenses</CardTitle>
     <CardDescription>Revenue and expenses over time period</CardDescription>
    </div>
    <Select
     value={period}
     onValueChange={(value) => handlePeriodChange(value as AnalyticsPeriod)}
    >
     <SelectTrigger className="w-[110px]">
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
    {data.length === 0 ? (
     <div className="flex flex-col items-center justify-center h-48">
      <EmptyStateIcon className="size-32" />
      <p>No revenue or expense data available.</p>
     </div>
    ) : (
     <Table className={cn(isPending && "opacity-60")}>
      <TableHeader>
       <TableRow>
        <TableHead>Time Period</TableHead>
        <TableHead>Revenue</TableHead>
        <TableHead>Expenses</TableHead>
        <TableHead>Net Profit</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {rows.map((row) => (
        <TableRow key={row.key} className="h-12">
         <TableCell>{row.label}</TableCell>
         <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
         <TableCell>{formatCurrency(row.totalExpenses)}</TableCell>
         <TableCell>{formatCurrency(row.netProfit)}</TableCell>
        </TableRow>
       ))}
      </TableBody>
     </Table>
    )}
   </CardContent>
  </Card>
 )
}