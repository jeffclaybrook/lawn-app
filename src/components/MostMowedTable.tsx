"use client"

import { useMemo, useState } from "react"
import type { MostMowedData } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { EmptyStateIcon } from "./Icons"

type MostMowedTableProps = {
 mowings: MostMowedData[]
}

type DisplayCount = "5" | "10" | "15"

export function MostMowedTable({ mowings }: MostMowedTableProps) {
 const [displayCount, setDisplayCount] = useState<DisplayCount>("5")

 const visibleMowings = useMemo(() => {
  return [...mowings]
   .sort((a, b) => b.mowingCount - a.mowingCount)
   .slice(0, Number(displayCount))
 }, [mowings, displayCount])

 return (
  <Card>
   <CardHeader className="flex flex-row items-center justify-between">
    <div>
     <CardTitle>Most Mowed</CardTitle>
     <CardDescription>Most mowed yards</CardDescription>
    </div>
    {visibleMowings.length > 0 && (
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
    {visibleMowings.length === 0 ? (
     <div className="flex flex-col items-center justify-center h-48">
      <EmptyStateIcon className="size-32" />
      <p>No mowing data available.</p>
     </div>
    ) : (
     <Table>
      <TableHeader>
       <TableRow>
        <TableHead className="w-[60px]">#</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Address</TableHead>
        <TableHead className="text-end">Mowings</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {visibleMowings.map((mowing, i) => (
        <TableRow key={mowing.id} className="h-12">
         <TableCell>{i + 1}</TableCell>
         <TableCell>{mowing.name}</TableCell>
         <TableCell>{mowing.address}</TableCell>
         <TableCell className="text-end">{mowing.mowingCount}</TableCell>
        </TableRow>
       ))}
      </TableBody>
     </Table>
    )}
   </CardContent>
  </Card>
 )
}