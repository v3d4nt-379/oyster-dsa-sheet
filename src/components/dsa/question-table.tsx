import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DifficultyBadge } from "@/components/dsa/difficulty-badge"
import { PracticeLink } from "@/components/dsa/practice-link"
import { BookmarkButton } from "@/components/dsa/bookmark-button"
import { Button } from "@/components/ui/button"
import { AppQuestion } from "@/types"

export interface QuestionTableProps {
  topicId: string
  questions: AppQuestion[]
  solvedIds: Set<string>
  bookmarkedIds: Set<string>
  onToggleSolved: (globalId: string) => void
  onToggleBookmark: (globalId: string) => void
}

export function QuestionTable({
  topicId,
  questions,
  solvedIds,
  bookmarkedIds,
  onToggleSolved,
  onToggleBookmark
}: QuestionTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="border-b transition-colors hover:bg-muted/50 text-left">
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12 text-center shrink-0">Status</th>
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-16 shrink-0">ID</th>
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground min-w-[200px]">Question</th>
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-40 shrink-0">Practice</th>
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-28 shrink-0">Difficulty</th>
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-24 shrink-0">Solution</th>
            <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12 text-center shrink-0">Bookmark</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {questions.map((q) => {
            const globalId = q.id // q.id is now the globally unique document ID
            const isSolved = solvedIds.has(globalId)
            const isBookmarked = bookmarkedIds.has(globalId)

            return (
              <tr key={q.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle text-center shrink-0">
                  <Checkbox 
                    checked={isSolved} 
                    onCheckedChange={() => onToggleSolved(globalId)} 
                  />
                </td>
                <td className="p-4 align-middle text-muted-foreground font-mono text-xs shrink-0">
                  {q.questionId}
                </td>
                <td className="p-4 align-middle font-medium">
                  {q.title}
                </td>
                <td className="p-4 align-middle shrink-0">
                  <div className="flex flex-wrap gap-2">
                    {q.links.map((link, idx) => (
                      <PracticeLink key={idx} platform={link.platform} href={link.url} />
                    ))}
                  </div>
                </td>
                <td className="p-4 align-middle shrink-0">
                  <DifficultyBadge difficulty={q.difficulty} />
                </td>
                <td className="p-4 align-middle shrink-0">
                  <Button variant="tertiary" size="sm" className="h-8 text-xs font-medium px-3">
                    Solution
                  </Button>
                </td>
                <td className="p-4 align-middle text-center shrink-0">
                  <BookmarkButton 
                    isBookmarked={isBookmarked} 
                    onToggleBookmark={() => onToggleBookmark(globalId)} 
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
