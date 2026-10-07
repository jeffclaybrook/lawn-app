"use client"

import { useMemo, useState } from "react"
import type { TopCustomersData } from "@/types"
import { formatCurrency } from "@/lib/helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { EmptyStateIcon } from "./Icons"

type TopCustomersTableProps = {
 customers: TopCustomersData[]
}

type DisplayCount = "5" | "10" | "15"

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
 const [displayCount, setDisplayCount] = useState<DisplayCount>("5")

 const visibleCustomers = useMemo(() => {
  return [...customers]
   .sort((a, b) => b.revenue - a.revenue)
   .slice(0, Number(displayCount))
 }, [customers, displayCount])

 return (
  <Card>
   <CardHeader className="flex flex-row items-center justify-between">
    <div>
     <CardTitle>Top Customers</CardTitle>
     <CardDescription>Top customers by revenue</CardDescription>
    </div>
    {visibleCustomers.length > 0 && (
     <Select
      value={displayCount}
      onValueChange={(value) => setDisplayCount(value as DisplayCount)}
     >
      <SelectTrigger className="w-[110px]">
       <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
       <SelectItem value="5">Top 5</SelectItem>
       <SelectItem value="10">Top 10</SelectItem>
       <SelectItem value="15">Top 15</SelectItem>
      </SelectContent>
     </Select>
    )}
   </CardHeader>
   <CardContent>
    {visibleCustomers.length === 0 ? (
     <div className="flex flex-col items-center justify-center h-48">
      <EmptyStateIcon className="size-32" />
      <p>No customer data available.</p>
     </div>
    ) : (
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead className="w-[60px]">#</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead className="text-end">Revenue</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {visibleCustomers.map((customer, i) => (
        <TableRow key={customer.id} className="h-12">
         <TableCell>{i + 1}</TableCell>
         <TableCell>{customer.name}</TableCell>
         <TableCell className="text-end">{formatCurrency(customer.revenue)}</TableCell>
        </TableRow>
       ))}
      </TableBody>
     </Table>
    )}
   </CardContent>
  </Card>
 )
}