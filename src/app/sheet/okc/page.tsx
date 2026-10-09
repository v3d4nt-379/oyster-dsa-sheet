"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { TopicDrawer } from "@/components/dsa/topic-drawer"
import { Loader2, Search, X, AlertCircle } from "lucide-react"
import { QuestionTable } from "@/components/dsa/question-table"
import { ProgressBar } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppTopic, DailySet, AppQuestion } from "@/types"
import { subscribeToOkcSheetData, subscribeToCurrentDailySet } from "@/lib/firestore/api"
import { 
  getOkcUserSolvedIds, 
  getOkcUserBookmarkIds, 
  markOkcQuestionSolved, 
  markOkcQuestionUnsolved, 
  addOkcBookmark, 
  removeOkcBookmark 
} from "@/lib/firestore/user-progress"

export default function OkcSheetPage() {
  const { user, loading, isAdmin, isClubMember } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = React.useState<"normal" | "daily">("normal")
  const [topics, setTopics] = React.useState<AppTopic[]>([])
  const [currentDailySet, setCurrentDailySet] = React.useState<DailySet | null>(null)
  const [isLoadingData, setIsLoadingData] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const [solvedIds, setSolvedIds] = React.useState<Set<string>>(new Set())
  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set())

  const [searchQuery, setSearchQuery] = React.useState("")
  const [difficultyFilter, setDifficultyFilter] = React.useState("All")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [topicFilter, setTopicFilter] = React.useState("All")
  const [bookmarkFilter, setBookmarkFilter] = React.useState("All")

  const loadUserProgress = React.useCallback(async (uid: string) => {
    try {
      const [solved, bookmarks] = await Promise.all([
        getOkcUserSolvedIds(uid),
        getOkcUserBookmarkIds(uid)
      ])
      setSolvedIds(solved)
      setBookmarkedIds(bookmarks)
    } catch (err) {
      console.error("Error loading user progress:", err)
      setActionError("Unable to load your progress.")
    }
  }, [])

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user) {
      // Validate access
      if (!isAdmin && !isClubMember) {
        router.push("/")
        return
      }

      loadUserProgress(user.uid)
      
      setIsLoadingData(true)
      const unsubscribe = subscribeToOkcSheetData(
        (data) => {
          setTopics(data)
          setIsLoadingData(false)
          setError(null)
        },
        (err) => {
          console.error("Error loading sheet data:", err)
          setError("Unable to load the OKC DSA sheet.")
          setIsLoadingData(false)
        }
      )
      
      const unsubscribeDailySet = subscribeToCurrentDailySet(
        (set) => setCurrentDailySet(set),
        (err) => console.error("Error loading daily set:", err)
      )
      
      return () => {
        unsubscribe()
        unsubscribeDailySet()
      }
    }
  }, [user, loading, router, loadUserProgress, isAdmin, isClubMember])

  // Clear action error after a few seconds
  React.useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [actionError])

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Prevent unauthorized render
  if (!isAdmin && !isClubMember) {
    return null
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h3 className="text-xl font-bold">{error}</h3>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground animate-pulse">Loading OKC sheet...</p>
      </div>
    )
  }

  const toggleSolved = async (id: string) => {
    const isCurrentlySolved = solvedIds.has(id)
    
    // Optimistic UI update
    setSolvedIds(prev => {
      const next = new Set(prev)
      if (isCurrentlySolved) next.delete(id)
      else next.add(id)
      return next
    })

    try {
      if (isCurrentlySolved) {
        await markOkcQuestionUnsolved(user.uid, id)
      } else {
        await markOkcQuestionSolved(user.uid, id)
      }
    } catch (err) {
      console.error("Failed to toggle solved state:", err)
      // Rollback
      setSolvedIds(prev => {
        const next = new Set(prev)
        if (isCurrentlySolved) next.add(id)
        else next.delete(id)
        return next
      })
      setActionError("Couldn't save your progress. Please try again.")
    }
  }

  const toggleBookmark = async (id: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.has(id)
    
    // Optimistic UI update
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (isCurrentlyBookmarked) next.delete(id)
      else next.add(id)
      return next
    })

    try {
      if (isCurrentlyBookmarked) {
        await removeOkcBookmark(user.uid, id)
      } else {
        await addOkcBookmark(user.uid, id)
      }
    } catch (err) {
      console.error("Failed to toggle bookmark state:", err)
      // Rollback
      setBookmarkedIds(prev => {
        const next = new Set(prev)
        if (isCurrentlyBookmarked) next.add(id)
        else next.delete(id)
        return next
      })
      setActionError("Couldn't update bookmark. Please try again.")
    }
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
  let totalSolvedCount = 0
  
  const filteredTopics: (AppTopic & { matchedQuestionsCount: number })[] = topics
    .filter(topic => isAdmin || topic.enabled !== false)
    .map(topic => {
      
      // Calculate overall progress based on strictly visible questions
      const visibleOriginalQuestions = topic.questions.filter(q => isAdmin || q.enabled !== false)
      totalQuestionsCount += visibleOriginalQuestions.length
      
      visibleOriginalQuestions.forEach(q => {
        if (solvedIds.has(q.id)) {
          totalSolvedCount++
        }
      })

      if (topicFilter !== "All" && topic.id !== topicFilter) {
        return { ...topic, questions: [], matchedQuestionsCount: 0 }
      }

      const filteredQuestions = topic.questions.filter(q => {
        // Enforce Question Visibility for normal users
        if (!isAdmin && q.enabled === false) return false

        const globalId = q.id
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
          if (!q.title.toLowerCase().includes(query) && !q.questionId.toLowerCase().includes(query)) {
            return false
          }
        }

        return true
      })

      return { ...topic, questions: filteredQuestions, matchedQuestionsCount: filteredQuestions.length }
    })
    .filter(topic => topic.matchedQuestionsCount > 0)

  const overallPercentage = totalQuestionsCount > 0 ? (totalSolvedCount / totalQuestionsCount) * 100 : 0

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 relative animate-in fade-in duration-500">
      
      {/* Toast Error Notification */}
      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-medium">{actionError}</p>
        </div>
      )}

      {/* Sheet Introduction */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">OKC DSA Sheet</h1>
          <Badge variant="brand" className="shadow-sm">Club Exclusive</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Exclusive daily sets and specialized problem collections for Oyster Kode Club members.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("normal")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
            activeTab === "normal"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Normal Sheet
        </button>
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
            activeTab === "daily"
              ? "border-brand-orange text-brand-orange"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Daily Set
        </button>
      </div>

      {activeTab === "daily" && (
        <div className="space-y-4 pt-4">
          {!currentDailySet ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center bg-card/30">
              <h3 className="text-xl font-bold tracking-tight">No Daily Set is available right now.</h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Check back later for new curated problem sets!
              </p>
            </div>
          ) : (
            (() => {
              // Gather questions while respecting order and visibility
              const dailyQuestions: AppQuestion[] = []
              const allQuestionsMap = new Map<string, AppQuestion>()
              const topicNameMap = new Map<string, string>()
              
              topics.forEach(t => {
                topicNameMap.set(t.id, t.title)
                t.questions.forEach(q => {
                  allQuestionsMap.set(q.id, q)
                })
              })
              
              currentDailySet.questionIds.forEach(id => {
                const q = allQuestionsMap.get(id)
                // The Daily Set's questionIds array is authoritative for visibility
                if (q) {
                  dailyQuestions.push(q)
                }
              })
              
              const totalSolvedCount = dailyQuestions.filter(q => solvedIds.has(q.id)).length
              const totalQuestionsCount = dailyQuestions.length
              
              const publishDate = currentDailySet.publishAt 
                ? new Date(typeof currentDailySet.publishAt.toMillis === 'function' ? currentDailySet.publishAt.toMillis() : currentDailySet.publishAt)
                : new Date()
                
              const formattedDate = publishDate.toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })

              // Group by topic, preserving the order of their first appearance
              const topicGroups: { topicId: string, topicTitle: string, questions: AppQuestion[] }[] = []
              
              dailyQuestions.forEach(q => {
                let group = topicGroups.find(g => g.topicId === q.topicId)
                if (!group) {
                  group = {
                    topicId: q.topicId,
                    topicTitle: topicNameMap.get(q.topicId) || "Other",
                    questions: []
                  }
                  topicGroups.push(group)
                }
                group.questions.push(q)
              })
              
              const overallPercentage = totalQuestionsCount > 0 ? (totalSolvedCount / totalQuestionsCount) * 100 : 0
              
              return (
                <div className="space-y-6">
                  {/* Daily Set Header */}
                  <div className="flex flex-col gap-2 pb-6 border-b">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <h2 className="text-xl font-bold tracking-tight">Daily Set: {formattedDate}</h2>
                      <span>{totalSolvedCount} / {totalQuestionsCount}</span>
                    </div>
                    <ProgressBar value={overallPercentage} className="h-2" />
                  </div>
                  
                  {/* Topics */}
                  {topicGroups.length > 0 ? (
                    <div className="space-y-4">
                      {topicGroups.map(group => {
                        const groupSolvedCount = group.questions.filter(q => solvedIds.has(q.id)).length
                        const groupTotalCount = group.questions.length
                        return (
                          <TopicDrawer 
                            key={group.topicId}
                            title={group.topicTitle}
                            solvedCount={groupSolvedCount}
                            totalCount={groupTotalCount}
                            defaultExpanded={true}
                          >
                            <QuestionTable 
                              topicId={group.topicId}
                              questions={group.questions}
                              solvedIds={solvedIds}
                              bookmarkedIds={bookmarkedIds}
                              onToggleSolved={toggleSolved}
                              onToggleBookmark={toggleBookmark}
                              solutionPrefix="/sheet/okc/question"
                            />
                          </TopicDrawer>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-card/30">
                      No visible questions found in this set.
                    </div>
                  )}
                </div>
              )
            })()
          )}
        </div>
      )}

      {activeTab === "normal" && (
        <>
          <div className="space-y-4 border-b pb-6">
            {/* Overall Progress */}
            <div className="flex flex-col gap-2 max-w-md">
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
              {topics.filter(t => isAdmin || t.enabled !== false).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
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
            {topics.filter(t => isAdmin || t.enabled !== false).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <h3 className="mt-4 text-lg font-semibold">Sheet is empty</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  No topics or questions available.
                </p>
              </div>
            ) : filteredTopics.length === 0 ? (
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
                const originalTopic = topics.find(t => t.id === topic.id)!
                const visibleOriginalQuestions = originalTopic.questions.filter(q => isAdmin || q.enabled !== false)
                const originalTotal = visibleOriginalQuestions.length
                const originalSolved = visibleOriginalQuestions.filter(q => solvedIds.has(q.id)).length

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
                      solutionPrefix="/sheet/okc/question"
                    />
                  </TopicDrawer>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
