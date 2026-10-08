import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getExpenses } from "@/lib/queries/expenses"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { CreateButton } from "@/components/CreateButton"
import { ExpensesTable } from "@/components/ExpensesTable"
import { Header } from "@/components/Header"

export default async function Expenses() {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const expenses = await getExpenses()

 return (
  <>
   <Header
    userName={session?.user.name}
    userImage={session?.user.image || undefined}
   >
    <Breadcrumb>
     <BreadcrumbList>
      <BreadcrumbItem>
       <BreadcrumbPage>Expenses</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 pb-4 md:px-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch pt-4 h-full">
      <ExpensesTable expenses={expenses} />
     </div>
     <CreateButton href={"/expenses/create"} />
    </SidebarInset>
   </div>
  </>
 )
}