"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDate } from "@/lib/helpers"
import type { CustomerListItem } from "@/lib/queries/customers"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, EmptyStateIcon, MoreIcon } from "./Icons"
import Link from "next/link"

type SortOrder = "asc" | "desc"

type CustomersTableProps = {
 customers: CustomerListItem[]
}

const PAGE_SIZE = 20

export function CustomersTable({ customers }: CustomersTableProps) {
 const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
 const [currentPage, setCurrentPage] = useState<number>(1)

 const sortedCustomers = useMemo(() => {
  return [...customers].sort((a, b) => {
   const comparison = a.name.localeCompare(
    b.name,
    undefined,
    {
     sensitivity: "base"
    }
   )

   return sortOrder === "asc"
    ? comparison
    : -comparison
  })
 }, [customers, sortOrder])

 const totalPages = Math.ceil(
  sortedCustomers.length / PAGE_SIZE
 )

 const paginatedCustomers = useMemo(() => {
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  return sortedCustomers.slice(startIndex, endIndex)
 }, [sortedCustomers, currentPage])

 const toggleSortOrder = () => {
  setSortOrder((current) =>
   current === "asc" ? "desc" : "asc"
  )

  setCurrentPage(1)
 }

 useEffect(() => {
  if (currentPage > totalPages && totalPages > 0) {
   // eslint-disable-next-line react-hooks/set-state-in-effect
   setCurrentPage(totalPages)
  }
 }, [currentPage, totalPages])

 return (
  <div>
   <Card>
    <CardHeader>
     <CardTitle>Customers</CardTitle>
    </CardHeader>
    <CardContent>
     {paginatedCustomers.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-[calc(81svh-var(--header-height))]!">
       <EmptyStateIcon className="size-32" />
       <p>No customers found.</p>
      </div>
     ) : (
      <Table>
       <TableHeader>
        <TableRow>
         <TableHead>
          <div
           role="button"
           onClick={toggleSortOrder}
           className="inline-flex items-center gap-1 cursor-pointer"
          >
           Name
           {sortOrder === "desc"
            ? <ArrowDownIcon className="size-3" />
            : <ArrowUpIcon className="size-3" />
           }
          </div>
         </TableHead>
         <TableHead>Address</TableHead>
         <TableHead>Last mowed</TableHead>
         <TableHead className="w-[80px] text-end">Actions</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {paginatedCustomers.map((customer) => (
         <TableRow key={customer.id} className="h-12">
          <TableCell>{customer.name}</TableCell>
          <TableCell>{customer.address}</TableCell>
          <TableCell>{formatDate(customer.lastMowedAt as Date) || "Not mowed yet."}</TableCell>
          <TableCell className="text-end">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
             <Button
              type="button"
              variant="ghost"
              size="icon"
             >
              <MoreIcon className="size-4" />
             </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
             <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" asChild>
               <Link href={`/customers/${customer.id}`}>
                <EditIcon className="size-4" />
                Edit
               </Link>
              </DropdownMenuItem>
             </DropdownMenuGroup>
            </DropdownMenuContent>
           </DropdownMenu>
          </TableCell>
         </TableRow>
        ))}
       </TableBody>
      </Table>
     )}
    </CardContent>
   </Card>
   {totalPages > 1 && (
    <div className="flex items-center justify-start gap-2">
     <Button
      type="button"
      variant="outline"
      onClick={() => setCurrentPage((page) => page - 1)}
      disabled={currentPage === 1}
     >
      <ChevronLeftIcon className="size-4" />
      Prev
     </Button>
     <Button
      type="button"
      variant="outline"
      onClick={() => setCurrentPage((page) => page + 1)}
      disabled={currentPage === totalPages}
     >
      Next
      <ChevronRightIcon className="size-4" />
     </Button>
    </div>
   )}
  </div>
 )
}