import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getCustomers } from "@/lib/queries/customers"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { CreateButton } from "@/components/CreateButton"
import { CustomersTable } from "@/components/CustomersTable"
import { Header } from "@/components/Header"

export default async function Customers() {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const customers = await getCustomers()

 return (
  <>
   <Header
    userName={session?.user.name}
    userImage={session?.user.image || undefined}
   >
    <Breadcrumb>
     <BreadcrumbList>
      <BreadcrumbItem>
       <BreadcrumbPage>Customers</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 p-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <CustomersTable customers={customers} />
     </div>
     <CreateButton href={"/customers/create"} />
    </SidebarInset>
   </div>
  </>
 )
}