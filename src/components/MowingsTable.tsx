"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteMowing } from "@/actions/mowings"
import { formatCurrency, formatDate } from "@/lib/helpers"
import type { MowingListItem } from "@/lib/queries/mowings"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon, EmptyStateIcon, MoreIcon } from "./Icons"
import Link from "next/link"

type SortOrder = "asc" | "desc"

type MowingsTableProps = {
 mowings: MowingListItem[]
}

const PAGE_SIZE = 20

export function MowingsTable({ mowings }: MowingsTableProps) {
 const [isPending, startTransition] = useTransition()
 const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
 const [currentPage, setCurrentPage] = useState<number>(1)
 const [mowingToDelete, setMowingToDelete] = useState<string | null>(null)
 const router = useRouter()

 const sortedMowings = useMemo(() => {
  return [...mowings].sort((a, b) => {
   const aTime = new Date(a.date).getTime()
   const bTime = new Date(b.date).getTime()

   return sortOrder === "asc"
    ? bTime - aTime
    : aTime - bTime
  })
 }, [mowings, sortOrder])

 const totalPages = Math.ceil(
  sortedMowings.length / PAGE_SIZE
 )

 const paginatedMowings = useMemo(() => {
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  return sortedMowings.slice(startIndex, endIndex)
 }, [sortedMowings, currentPage])

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
  if (!mowingToDelete) {
   return
  }

  const id = mowingToDelete

  startTransition(async () => {
   await deleteMowing(id)
   router.refresh()
   toast.success("Mowing successfully deleted")
   setMowingToDelete(null)
  })
 }

 return (
  <div className="space-y-4">
   <Card>
    <CardHeader>
     <CardTitle>Mowings</CardTitle>
    </CardHeader>
    <CardContent>
     {paginatedMowings.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-[calc(81svh-var(--header-height))]!">
       <EmptyStateIcon className="size-32" />
       <p>No mowings found.</p>
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
         <TableHead>Customer</TableHead>
         <TableHead>Amount</TableHead>
         <TableHead className="w-[80px] text-end">Actions</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {paginatedMowings.map((mowing) => (
         <TableRow key={mowing.id} className="h-12">
          <TableCell>{formatDate(mowing.date)}</TableCell>
          <TableCell>{mowing.customerName}</TableCell>
          <TableCell>{formatCurrency(Number(mowing.amount))}</TableCell>
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
               <Link href={`/mowings/${mowing.id}`}>
                <EditIcon className="size-4" />
                Edit
               </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
               variant="destructive"
               className="cursor-pointer"
               onSelect={(e) => {
                e.preventDefault()
                setMowingToDelete(mowing.id)
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
    open={mowingToDelete !== null}
    onOpenChange={(open) => {
     if (!open) {
      setMowingToDelete(null)
     }
    }}
   >
    <AlertDialogContent>
     <AlertDialogHeader>
      <AlertDialogTitle>Are you sure you want to delete this mowing?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone and will permanently delete this mowing.</AlertDialogDescription>
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