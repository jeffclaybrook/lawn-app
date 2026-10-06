import { redirect } from "next/navigation"
import { getSession } from "@/lib/get-session"
import { getMowings } from "@/lib/queries/mowings"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { CreateButton } from "@/components/CreateButton"
import { Header } from "@/components/Header"
import { MowingsTable } from "@/components/MowingsTable"

export default async function Mowings() {
 const session = await getSession()

 if (!session) {
  redirect("/auth/sign-in")
 }

 const mowings = await getMowings()

 return (
  <>
   <Header
    userName={session?.user.name}
    userImage={session?.user.image || undefined}
   >
    <Breadcrumb>
     <BreadcrumbList>
      <BreadcrumbItem>
       <BreadcrumbPage>Mowings</BreadcrumbPage>
      </BreadcrumbItem>
     </BreadcrumbList>
    </Breadcrumb>
   </Header>
   <div className="flex flex-1">
    <AppSidebar />
    <SidebarInset className="flex flex-col gap-4 flex-1 p-4 pt-[--header-height:calc(--spacing(14))] overflow-y-auto">
     <div className="flex flex-col items-stretch gap-4 pt-4 h-full">
      <MowingsTable mowings={mowings} />
     </div>
     <CreateButton href={"/mowings/create"} />
    </SidebarInset>
   </div>
  </>
 )
}