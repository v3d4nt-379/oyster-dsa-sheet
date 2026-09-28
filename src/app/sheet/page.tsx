"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { TopicDrawer } from "@/components/dsa/topic-drawer"
import { Loader2, Search, X } from "lucide-react"
import { MOCK_TOPICS, Topic } from "@/data/mock-questions"
import { QuestionTable } from "@/components/dsa/question-table"
import { ProgressBar } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function SheetPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [solvedIds, setSolvedIds] = React.useState<Set<string>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set())

  const [searchQuery, setSearchQuery] = React.useState("")
  const [difficultyFilter, setDifficultyFilter] = React.useState("All")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [topicFilter, setTopicFilter] = React.useState("All")
  const [bookmarkFilter, setBookmarkFilter] = React.useState("All")

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

  const toggleSolved = (id: string) => {
    setSolvedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setDifficultyFilter("All")
    setStatusFilter("All")
    setTopicFilter("All")
    setBookmarkFilter("All")
  }

  const isFiltering = 
    searchQuery !== "" || 
    difficultyFilter !== "All" || 
    statusFilter !== "All" || 
    topicFilter !== "All" || 
    bookmarkFilter !== "All"

  // Process data
  let totalQuestionsCount = 0
  
  const filteredTopics: (Topic & { matchedQuestionsCount: number })[] = MOCK_TOPICS.map(topic => {
    totalQuestionsCount += topic.questions.length

    if (topicFilter !== "All" && topic.id !== topicFilter) {
      return { ...topic, questions: [], matchedQuestionsCount: 0 }
    }

    const filteredQuestions = topic.questions.filter(q => {
      const globalId = `${topic.id}-${q.id}`
      const isSolved = solvedIds.has(globalId)
      const isBookmarked = bookmarkedIds.has(globalId)

      // Difficulty
      if (difficultyFilter !== "All" && q.difficulty !== difficultyFilter) return false
      // Status
      if (statusFilter === "Solved" && !isSolved) return false
      if (statusFilter === "Unsolved" && isSolved) return false
      // Bookmark
      if (bookmarkFilter === "Bookmarked" && !isBookmarked) return false
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!q.title.toLowerCase().includes(query) && !q.id.toLowerCase().includes(query)) {
          return false
        }
      }

      return true
    })

    return { ...topic, questions: filteredQuestions, matchedQuestionsCount: filteredQuestions.length }
  }).filter(topic => topic.matchedQuestionsCount > 0) // Hide topics with 0 matches

  const totalSolvedCount = solvedIds.size
  const overallPercentage = totalQuestionsCount > 0 ? (totalSolvedCount / totalQuestionsCount) * 100 : 0

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Sheet Introduction */}
      <div className="space-y-4 border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">DSA Sheet</h1>
        <p className="text-muted-foreground text-lg">
          A structured roadmap to practice, track, and master Data Structures & Algorithms.
        </p>
        
        {/* Overall Progress */}
        <div className="flex flex-col gap-2 pt-2 max-w-md">
          <div className="flex justify-between text-sm font-medium">
            <span>Overall Progress</span>
            <span>{totalSolvedCount} / {totalQuestionsCount} problems solved</span>
          </div>
          <ProgressBar value={overallPercentage} className="h-2" />
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col gap-4 rounded-lg bg-card p-4 shadow-sm border md:flex-row md:items-center md:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        <select 
          value={topicFilter} 
          onChange={(e) => setTopicFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="All">All Topics</option>
          {MOCK_TOPICS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>

        <select 
          value={difficultyFilter} 
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="All">All Statuses</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>

        <select 
          value={bookmarkFilter} 
          onChange={(e) => setBookmarkFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="All">All Bookmarks</option>
          <option value="Bookmarked">Bookmarked</option>
        </select>

        {isFiltering && (
          <Button variant="tertiary" size="sm" onClick={clearFilters} className="h-10 px-3 text-muted-foreground hover:text-foreground">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Main Sheet */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in">
            <h3 className="mt-4 text-lg font-semibold">No questions found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Try changing your search or filters to find what you're looking for.
            </p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            // Find original topic to calculate real progress (solved out of total available in that topic)
            const originalTopic = MOCK_TOPICS.find(t => t.id === topic.id)!
            const originalTotal = originalTopic.questions.length
            const originalSolved = originalTopic.questions.filter(q => solvedIds.has(`${topic.id}-${q.id}`)).length

            return (
              <TopicDrawer 
                key={topic.id} 
                title={topic.title} 
                solvedCount={originalSolved} 
                totalCount={originalTotal}
                forceExpand={isFiltering}
              >
                <QuestionTable 
                  topicId={topic.id}
                  questions={topic.questions}
                  solvedIds={solvedIds}
                  bookmarkedIds={bookmarkedIds}
                  onToggleSolved={toggleSolved}
                  onToggleBookmark={toggleBookmark}
                />
              </TopicDrawer>
            )
          })
        )}
      </div>
    </div>
  )
}
