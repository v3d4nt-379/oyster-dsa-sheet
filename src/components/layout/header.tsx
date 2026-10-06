"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, UserCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth-context"
import Link from "next/link"

export function Header() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* Official Club Logo */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <img src="/logo-light.jpg" alt="DSA Sheet Logo" className="h-full w-full object-contain dark:hidden" />
            <img src="/logo-dark.jpg" alt="DSA Sheet Logo" className="hidden h-full w-full object-contain dark:block" />
          </div>
          <span className="font-bold text-lg hidden sm:inline-block tracking-tight">DSA Sheet</span>
        </Link>

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

          {user && (
            <div className="relative">
              <Button 
                variant="icon" 
                size="icon" 
                aria-label="Profile"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full overflow-hidden"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />
                )}
              </Button>
              
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col space-y-1 p-4 border-b">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="tertiary" 
                          className="w-full justify-start rounded-sm px-2 text-sm text-foreground hover:bg-muted"
                        >
                          <UserCircle className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Button 
                        variant="tertiary" 
                        className="w-full justify-start rounded-sm px-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive mt-1"
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut()
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
