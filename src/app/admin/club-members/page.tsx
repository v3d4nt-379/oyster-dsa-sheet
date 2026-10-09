"use client"

import * as React from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/types"
import { getAllUsers, updateUserMembership } from "@/lib/firestore/admin"
import { Loader2, Search, AlertCircle, Shield, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"

export default function ClubMembersAdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = React.useState<UserProfile[]>([])
  const [isLoadingData, setIsLoadingData] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isProcessingUid, setIsProcessingUid] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [loading, user, isAdmin, router])

  const loadData = React.useCallback(async () => {
    try {
      setIsLoadingData(true)
      setError(null)
      const allUsers = await getAllUsers()
      // Sort by creation date if possible, otherwise by name
      allUsers.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis()
        }
        return (a.name || "").localeCompare(b.name || "")
      })
      setUsers(allUsers)
    } catch (err) {
      console.error("Failed to load users:", err)
      setError("Failed to load users. Please check your connection and try again.")
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  React.useEffect(() => {
    if (user && isAdmin) {
      loadData()
    }
  }, [user, isAdmin, loadData])

  const handleMakeMember = async (uid: string) => {
    try {
      setIsProcessingUid(uid)
      setActionError(null)
      setActionSuccess(null)
      await updateUserMembership(uid, true)
      setActionSuccess("Club membership granted.")
      await loadData() // Refresh list
    } catch (err) {
      console.error("Failed to make member:", err)
      setActionError("Failed to update membership.")
    } finally {
      setIsProcessingUid(null)
    }
  }

  const handleRemoveMember = async (uid: string) => {
    if (!confirm("Remove Club Membership?\n\nThis user will lose access to the OKC DSA Sheet.")) {
      return
    }
    try {
      setIsProcessingUid(uid)
      setActionError(null)
      setActionSuccess(null)
      await updateUserMembership(uid, false)
      setActionSuccess("Club membership removed.")
      await loadData() // Refresh list
    } catch (err) {
      console.error("Failed to remove member:", err)
      setActionError("Failed to update membership.")
    } finally {
      setIsProcessingUid(null)
    }
  }

  // Clear toast after 3s
  React.useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null)
        setActionError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [actionSuccess, actionError])

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const nameMatch = (u.name || "").toLowerCase().includes(query)
    const emailMatch = (u.email || "").toLowerCase().includes(query)
    const usernameMatch = (u.username || "").toLowerCase().includes(query)
    return nameMatch || emailMatch || usernameMatch
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12 relative animate-in fade-in duration-500">
      {/* Toast Notifications */}
      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-medium">{actionError}</p>
        </div>
      )}
      {actionSuccess && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Shield className="h-4 w-4" />
          <p className="text-sm font-medium">{actionSuccess}</p>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">Club Members Management</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Manage Oyster Kode Club membership access.
        </p>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center rounded-lg border border-destructive/20 bg-destructive/10 p-12">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-xl font-bold text-destructive">{error}</h3>
          <Button variant="secondary" onClick={loadData}>Try Again</Button>
        </div>
      ) : isLoadingData ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground animate-pulse">Loading users...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-lg bg-card p-4 shadow-sm border md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 transition-colors">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Membership</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No registered users found.
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No users match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              photoURL={u.photoURL}
                              name={u.name}
                              email={u.email}
                              size="sm"
                            />
                            <span className="font-medium">{u.name || "—"}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {u.username ? `@${u.username}` : "—"}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {u.email || "—"}
                        </td>
                        <td className="p-4 align-middle">
                          {u.isClubMember ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-semibold text-brand-orange">
                              <Shield className="h-3.5 w-3.5" />
                              Club Member
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              Not a Member
                            </span>
                          )}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button
                            variant={u.isClubMember ? "secondary" : "primary"}
                            size="sm"
                            className={!u.isClubMember ? "bg-brand-orange hover:bg-brand-orange/90 text-white" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                            disabled={isProcessingUid === u.uid}
                            onClick={() => u.isClubMember ? handleRemoveMember(u.uid) : handleMakeMember(u.uid)}
                          >
                            {isProcessingUid === u.uid ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : u.isClubMember ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Remove Membership
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Club Member
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
