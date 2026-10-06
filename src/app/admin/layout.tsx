"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/firebase/auth-context"
import { Loader2, LayoutDashboard, Target, CalendarDays, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/")
      }
    }
  }, [loading, user, isAdmin, router])

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const navItems = [
    { name: "Marathon Sheet", href: "/admin/marathon", icon: LayoutDashboard },
    { name: "OKC DSA Sheet", href: "/admin/okc", icon: Target },
    { name: "Daily Sets", href: "/admin/daily-sets", icon: CalendarDays },
    { name: "Club Members", href: "/admin/club-members", icon: Users },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r bg-card shrink-0">
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
          <p className="text-sm text-muted-foreground mt-1">Platform management</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href) || (pathname === "/admin" && item.href === "/admin/marathon")
            const Icon = item.icon
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  )
}
