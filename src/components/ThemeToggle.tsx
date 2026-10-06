"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"

export function ThemeToggle() {
 const { resolvedTheme, setTheme } = useTheme()

 const toggleTheme = () => {
  setTheme(resolvedTheme === "dark" ? "light" : "dark")
 }

 return (
  <Button
   type="button"
   variant="outline"
   size="icon"
   onClick={toggleTheme}
  >
   <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
   <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
   <span className="sr-only">Toggle theme</span>
  </Button>
 )
}