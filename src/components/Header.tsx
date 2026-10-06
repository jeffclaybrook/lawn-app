"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth-client"
import { formatInitials } from "@/lib/helpers"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Separator } from "./ui/separator"
import { useSidebar } from "./ui/sidebar"
import { SidebarIcon, SignOutIcon } from "./Icons"
import { ThemeToggle } from "./ThemeToggle"

type HeaderProps = {
 children?: ReactNode
 userName?: string
 userImage?: string
}

export function Header({
 children,
 userName,
 userImage
}: HeaderProps) {
 const { toggleSidebar } = useSidebar()
 const router = useRouter()

 return (
  <header className="flex items-center w-full border-b bg-card fixed top-0 z-50">
   <div className="flex items-center gap-2 px-4 h-(--header-height) w-full">
    <Button
     type="button"
     variant="ghost"
     size="icon"
     onClick={toggleSidebar}
    >
     <SidebarIcon className="size-4" />
     <span className="sr-only">Toggle sidebar</span>
    </Button>
    <Separator orientation="vertical" className="mr-2 h-(--header-height)" />
    {children}
    <div className="flex items-center gap-4 ml-auto">
     <ThemeToggle />
     <DropdownMenu>
      <DropdownMenuTrigger asChild>
       <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
       >
        <Avatar>
         <AvatarImage src={userImage} alt={userName} />
         <AvatarFallback>{formatInitials(userName || "")}</AvatarFallback>
        </Avatar>
       </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
       <DropdownMenuGroup>
        <DropdownMenuItem
         variant="destructive"
         onClick={() => {
          signOut()
          router.push("/auth/sign-in")
         }}
         className="cursor-pointer"
        >
         <SignOutIcon className="size-4" />
         Sign out
        </DropdownMenuItem>
       </DropdownMenuGroup>
      </DropdownMenuContent>
     </DropdownMenu>
    </div>
   </div>
  </header>
 )
}