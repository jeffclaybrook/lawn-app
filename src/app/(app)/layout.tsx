import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function AppLayout({
 children
}: {
 children: ReactNode
}) {
 return (
  <div className="[--header-height:calc(--spacing(14))]">
   <SidebarProvider className="flex flex-col">
    {children}
   </SidebarProvider>
  </div>
 )
}