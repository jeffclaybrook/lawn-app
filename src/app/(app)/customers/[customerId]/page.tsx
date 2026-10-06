import { redirect, notFound } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getCustomer } from "@/lib/queries/customers"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { CustomerForm } from "@/components/CustomerForm"
import { Header } from "@/components/Header"

export default async function EditCustomer({
 params
}: {
 params: Promise<{ customerId: string }>
}) {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const { customerId } = await params
 const customer = await getCustomer(customerId)

 if (!customer) {
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
       <BreadcrumbLink href={"/customers"}>Customers</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
       <BreadcrumbPage>Edit customer</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 p-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <CustomerForm customer={customer} />
     </div>
    </SidebarInset>
   </div>
  </>
 )
}