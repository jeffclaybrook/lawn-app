"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteExpense } from "@/actions/expenses"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { ExpenseListItem } from "@/lib/queries/expenses"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon, EmptyStateIcon, MoreIcon } from "./Icons"
import Link from "next/link"

type SortOrder = "asc" | "desc"

type ExpensesTableProps = {
 expenses: ExpenseListItem[]
}

const PAGE_SIZE = 20

export function ExpensesTable({ expenses }: ExpensesTableProps) {
 const [isPending, startTransition] = useTransition()
 const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
 const [currentPage, setCurrentPage] = useState<number>(1)
 const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
 const router = useRouter()

 const sortedExpenses = useMemo(() => {
  return [...expenses].sort((a, b) => {
   const aTime = new Date(a.date).getTime()
   const bTime = new Date(b.date).getTime()

   return sortOrder === "desc"
    ? bTime - aTime
    : aTime - bTime
  })
 }, [expenses, sortOrder])

 const totalPages = Math.ceil(
  sortedExpenses.length / PAGE_SIZE
 )

 const paginatedExpenses = useMemo(() => {
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  return sortedExpenses.slice(startIndex, endIndex)
 }, [sortedExpenses, currentPage])

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

 const handleDelete = () => {
  if (!expenseToDelete) {
   return
  }

  const id = expenseToDelete

  startTransition(async () => {
   await deleteExpense(id)
   router.refresh()
   toast.success("Expense successfully deleted")
   setExpenseToDelete(null)
  })
 }

 return (
  <div>
   <Card>
    <CardHeader>
     <CardTitle>Expenses</CardTitle>
    </CardHeader>
    <CardContent>
     {paginatedExpenses.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-[calc(81svh-var(--header-height))]!">
       <EmptyStateIcon className="size-32" />
       <p>No expenses found.</p>
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
           Date
           {sortOrder === "desc"
            ? <ArrowDownIcon className="size-3" />
            : <ArrowUpIcon className="size-3" />
           }
          </div>
         </TableHead>
         <TableHead>Description</TableHead>
         <TableHead>Amount</TableHead>
         <TableHead className="w-[80px] text-end">Actions</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {paginatedExpenses.map((expense) => (
         <TableRow key={expense.id} className="h-12">
          <TableCell>{formatDate(expense.date)}</TableCell>
          <TableCell>{expense.description}</TableCell>
          <TableCell>{formatCurrency(Number(expense.amount))}</TableCell>
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
               <Link href={`/expenses/${expense.id}`}>
                <EditIcon className="size-4" />
                Edit
               </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
               variant="destructive"
               className="cursor-pointer"
               onSelect={(e) => {
                e.preventDefault()
                setExpenseToDelete(expense.id)
               }}
              >
               <DeleteIcon className="size-4" />
               Delete
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
   <AlertDialog
    open={expenseToDelete !== null}
    onOpenChange={(open) => {
     if (!open) {
      setExpenseToDelete(null)
     }
    }}
   >
    <AlertDialogContent>
     <AlertDialogHeader>
      <AlertDialogTitle>Are you sure you want to delete this expense?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone and will permanently delete this expense.</AlertDialogDescription>
     </AlertDialogHeader>
     <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
       variant="destructive"
       onClick={handleDelete}
       disabled={isPending}
      >
       <DeleteIcon className="size-4" />
       Delete
      </AlertDialogAction>
     </AlertDialogFooter>
    </AlertDialogContent>
   </AlertDialog>
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