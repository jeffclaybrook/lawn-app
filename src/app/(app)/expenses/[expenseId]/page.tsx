import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getExpense } from "@/lib/queries/expenses"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ExpenseForm } from "@/components/ExpenseForm"
import { Header } from "@/components/Header"

export default async function EditExpense({
 params
}: {
 params: Promise<{ expenseId: string }>
}) {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const { expenseId } = await params
 const expense = await getExpense(expenseId)

 if (!expense) {
  notFound()
 }

 return (
  <>
   <Header
    userName={session?.user.name}
    userImage={session?.user.image || undefined}
   >
    <Breadcrumb>
     <BreadcrumbList>
      <BreadcrumbItem>
       <BreadcrumbLink href={"/expenses"}>Expenses</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
       <BreadcrumbPage>Edit expense</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 p-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <ExpenseForm expense={expense} />
     </div>
    </SidebarInset>
   </div>
  </>
 )
}