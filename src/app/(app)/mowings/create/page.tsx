import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getCustomers } from "@/lib/queries/customers"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Header } from "@/components/Header"
import { MowingForm } from "@/components/MowingForm"

export default async function CreateMowing() {
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
       <BreadcrumbLink href={"/mowings"}>Mowings</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
       <BreadcrumbPage>Create mowing</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 p-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <MowingForm customers={customers} />
     </div>
    </SidebarInset>
   </div>
  </>
 )
}