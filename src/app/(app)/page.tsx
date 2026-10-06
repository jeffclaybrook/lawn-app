import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getTransactions } from "@/lib/queries/transactions"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "@/components/Header"
import { TransactionsTable } from "@/components/TransactionsTable"

export default async function Home() {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const transactions = await getTransactions()

 return (
  <>
   <Header
    userName={session?.user.name}
    userImage={session?.user.image || undefined}
   >
    <Breadcrumb>
     <BreadcrumbList>
      <BreadcrumbItem>
       <BreadcrumbPage>Home</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 p-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <TransactionsTable transactions={transactions} />
     </div>
    </SidebarInset>
   </div>
  </>
 )
}