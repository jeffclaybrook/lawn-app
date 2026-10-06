"use client"

import { useMediaQuery } from "usehooks-ts"
import { Button } from "./ui/button"
import { PlusIcon } from "./Icons"
import Link from "next/link"

export function CreateButton({
 href
}: {
 href: string
}) {
 const isMobile = useMediaQuery("(max-width: 1024px)", {
  initializeWithValue: false
 })

 return (
  <Button
   type="button"
   size={isMobile ? "sm" : "lg"}
   className="fixed bottom-6 right-6 z-50 shadow-lg rounded-lg !h-11"
   asChild
  >
   <Link href={href}>
    <PlusIcon className="size-6" />
    {!isMobile && <span className="inline-block">Create</span>}
    <span className="sr-only">Create</span>
   </Link>
  </Button>
 )
}