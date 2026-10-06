"use client"

import { ComponentProps } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar"
import { AnalyticsIcon, AnalyticsFilledIcon, CustomersIcon, CustomersFilledIcon, ExpensesIcon, ExpensesFilledIcon, HomeIcon, HomeFilledIcon, MowingIcon, MowingFilledIcon } from "./Icons"
import Link from "next/link"

const links = [
 { label: "Home", href: "/", icon: HomeIcon, activeIcon: HomeFilledIcon },
 { label: "Mowings", href: "/mowings", icon: MowingIcon, activeIcon: MowingFilledIcon },
 { label: "Customers", href: "/customers", icon: CustomersIcon, activeIcon: CustomersFilledIcon },
 { label: "Expenses", href: "/expenses", icon: ExpensesIcon, activeIcon: ExpensesFilledIcon },
 { label: "Analytics", href: "/analytics", icon: AnalyticsIcon, activeIcon: AnalyticsFilledIcon }
]

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
 const { isMobile, setOpenMobile } = useSidebar()
 const pathname = usePathname()

 return (
  <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
   <SidebarContent>
    <SidebarGroup>
     <SidebarMenu>
      {links.map((link) => (
       <SidebarMenuItem key={link.label}>
        <SidebarMenuButton
         size="md"
         className={cn(
          "hover:bg-sidebar-ring/20",
          pathname === link.href && "bg-sidebar-ring/25"
         )}
         asChild
        >
         <Link
          href={link.href}
          onClick={() => {
           if (isMobile) {
            setOpenMobile(false)
           }
          }}
         >
          {pathname === link.href
           ? <link.activeIcon />
           : <link.icon />
          }
          {link.label}
         </Link>
        </SidebarMenuButton>
       </SidebarMenuItem>
      ))}
     </SidebarMenu>
    </SidebarGroup>
   </SidebarContent>
  </Sidebar>
 )
}