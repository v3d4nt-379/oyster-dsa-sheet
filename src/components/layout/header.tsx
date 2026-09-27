"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Logo placeholder - using a div with gradient for Phase 1 */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-gold via-brand-orange to-brand-pink text-white font-bold text-lg">
            D
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">DSA Sheet</span>
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="icon"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}
          <Button variant="icon" size="icon" aria-label="Profile">
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
