"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DifficultyBadge } from "@/components/dsa/difficulty-badge"
import { PracticeLink } from "@/components/dsa/practice-link"
import { BookmarkButton } from "@/components/dsa/bookmark-button"
import { TopicDrawer } from "@/components/dsa/topic-drawer"
import { Loader2 } from "lucide-react"

export default function SheetPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Local states for mock interaction
  const [isBookmarked1, setIsBookmarked1] = React.useState(false)
  const [isSolved1, setIsSolved1] = React.useState(true)
  const [isBookmarked2, setIsBookmarked2] = React.useState(true)
  const [isSolved2, setIsSolved2] = React.useState(true)
  const [isBookmarked3, setIsBookmarked3] = React.useState(false)
  const [isSolved3, setIsSolved3] = React.useState(false)

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="space-y-2 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.displayName || "User"}</h1>
        <p className="text-muted-foreground">
          Continue your DSA practice. You've got this.
        </p>
      </div>

      <div className="space-y-4">
        {/* Mock Data Topic Drawers */}
        <TopicDrawer title="ARRAYS" solvedCount={2} totalCount={3} defaultExpanded>
          <div className="w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 text-left">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12 text-center">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-16">ID</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Question</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-48">Practice</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-28">Difficulty</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-24">Solution</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12 text-center">Bookmark</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-center">
                    <Checkbox checked={isSolved1} onCheckedChange={setIsSolved1} />
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">01</td>
                  <td className="p-4 align-middle font-medium">Largest Element in an Array</td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <PracticeLink platform="LeetCode" />
                    </div>
                  </td>
                  <td className="p-4 align-middle"><DifficultyBadge difficulty="Easy" /></td>
                  <td className="p-4 align-middle">
                    <Button variant="tertiary" size="sm" className="h-8 text-xs">Solution</Button>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <BookmarkButton isBookmarked={isBookmarked1} onToggleBookmark={setIsBookmarked1} />
                  </td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-center">
                    <Checkbox checked={isSolved2} onCheckedChange={setIsSolved2} />
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">02</td>
                  <td className="p-4 align-middle font-medium">Second Largest Element</td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <PracticeLink platform="GeeksforGeeks" />
                    </div>
                  </td>
                  <td className="p-4 align-middle"><DifficultyBadge difficulty="Medium" /></td>
                  <td className="p-4 align-middle">
                    <Button variant="tertiary" size="sm" className="h-8 text-xs">Solution</Button>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <BookmarkButton isBookmarked={isBookmarked2} onToggleBookmark={setIsBookmarked2} />
                  </td>
                </tr>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle text-center">
                    <Checkbox checked={isSolved3} onCheckedChange={setIsSolved3} />
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">03</td>
                  <td className="p-4 align-middle font-medium">Check if Array Is Sorted</td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <PracticeLink platform="CodeChef" />
                      <PracticeLink platform="LeetCode" />
                    </div>
                  </td>
                  <td className="p-4 align-middle"><DifficultyBadge difficulty="Hard" /></td>
                  <td className="p-4 align-middle">
                    <Button variant="tertiary" size="sm" className="h-8 text-xs">Solution</Button>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <BookmarkButton isBookmarked={isBookmarked3} onToggleBookmark={setIsBookmarked3} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TopicDrawer>
        
        <TopicDrawer title="HASHING" solvedCount={0} totalCount={4}>
          <div className="p-4 text-sm text-muted-foreground text-center">Questions loading...</div>
        </TopicDrawer>
        
        <TopicDrawer title="BINARY SEARCH" solvedCount={0} totalCount={8}>
          <div className="p-4 text-sm text-muted-foreground text-center">Questions loading...</div>
        </TopicDrawer>
        
        <TopicDrawer title="LINKED LIST" solvedCount={0} totalCount={12}>
          <div className="p-4 text-sm text-muted-foreground text-center">Questions loading...</div>
        </TopicDrawer>
      </div>
    </div>
  )
}
