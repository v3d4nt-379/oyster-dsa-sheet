"use client"

import * as React from "react"
import { useAuth } from "@/lib/firebase/auth-context"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/firestore/user-profile"
import { getUserSolvedRecords, SolvedRecord } from "@/lib/firestore/user-progress"
import { fetchSheetData } from "@/lib/firestore/api"
import { AppTopic, AppQuestion, UserProfile } from "@/types"
import { UserCircle, Loader2, LogOut, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DifficultyBadge } from "@/components/dsa/difficulty-badge"


export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [questions, setQuestions] = React.useState<AppQuestion[]>([])
  const [solvedRecords, setSolvedRecords] = React.useState<SolvedRecord[]>([])
  
  const [isLoadingData, setIsLoadingData] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [loading, user, router])

  React.useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        setIsLoadingData(true)
        const [prof, sheetTopics, records] = await Promise.all([
          getUserProfile(user.uid),
          fetchSheetData(),
          getUserSolvedRecords(user.uid)
        ])
        
        setProfile(prof)
        
        // Flatten questions for easier counting
        const allQuestions = sheetTopics.flatMap(t => t.questions)
        setQuestions(allQuestions)
        setSolvedRecords(records)
      } catch (err) {
        console.error("Failed to load profile data", err)
        setError("Unable to load your profile. Please try again.")
      } finally {
        setIsLoadingData(false)
      }
    }
    
    if (user) {
      loadData()
    }
  }, [user])

  if (loading || isLoadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile) {
    return error ? (
      <div className="p-8 text-center text-destructive">{error}</div>
    ) : null
  }

  // Derived Progress
  const totalQuestions = questions.length
  const solvedCount = solvedRecords.length
  const progressPercent = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0

  const diffStats = {
    Easy: { total: 0, solved: 0 },
    Medium: { total: 0, solved: 0 },
    Hard: { total: 0, solved: 0 }
  }

  questions.forEach(q => {
    diffStats[q.difficulty].total++
  })

  const solvedSet = new Set(solvedRecords.map(r => r.questionId))
  questions.forEach(q => {
    if (solvedSet.has(q.id)) {
      diffStats[q.difficulty].solved++
    }
  })

  // Recently Solved (Sort by timestamp descending, keep top 5)
  // Note: pending writes might have null solvedAt, fallback to Date.now() for sorting purposes
  const sortedRecords = [...solvedRecords].sort((a, b) => {
    const timeA = a.solvedAt?.toMillis ? a.solvedAt.toMillis() : Date.now()
    const timeB = b.solvedAt?.toMillis ? b.solvedAt.toMillis() : Date.now()
    return timeB - timeA
  })
  const recentRecords = sortedRecords.slice(0, 5)

  // Map recently solved IDs back to question details
  const recentQuestions = recentRecords.map(r => {
    const q = questions.find(question => question.id === r.questionId)
    return { record: r, question: q }
  }).filter(item => item.question !== undefined) as { record: SolvedRecord, question: AppQuestion }[]

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 space-y-8 pb-20">
      
      {/* Back Navigation */}
      <div>
        <Link href="/sheet" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Sheet
        </Link>
      </div>

      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-6 border rounded-xl p-6 bg-card relative">
        <div className="h-24 w-24 shrink-0 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center font-bold text-2xl text-muted-foreground">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
          ) : (
            user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle className="h-12 w-12" />
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2 mt-2 md:mt-4">
          <h1 className="text-2xl font-bold">{user.displayName || "Anonymous User"}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="text-destructive hover:bg-destructive/10" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </section>

      {/* Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Progress */}
          <section className="border rounded-xl p-6 bg-card space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4">Progress</h2>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold">{solvedCount} <span className="text-lg text-muted-foreground font-normal">/ {totalQuestions}</span></span>
                <span className="text-sm font-medium text-brand">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-brand transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              {["Easy", "Medium", "Hard"].map(diff => {
                const stat = diffStats[diff as keyof typeof diffStats]
                const diffPercent = stat.total > 0 ? Math.round((stat.solved / stat.total) * 100) : 0
                const colorClass = diff === "Easy" ? "bg-emerald-500" : diff === "Medium" ? "bg-amber-500" : "bg-red-500"
                
                return (
                  <div key={diff}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{diff}</span>
                      <span className="text-muted-foreground">{stat.solved} / {stat.total}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${colorClass}`} style={{ width: `${diffPercent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

        {/* Recently Solved */}
        <section className="border rounded-xl p-6 bg-card space-y-4 flex flex-col">
            <h2 className="text-lg font-bold">Recently Solved</h2>
            {recentQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No solved problems yet.</p>
            ) : (
              <div className="space-y-3">
                {recentQuestions.map(({ question }) => (
                  <Link 
                    key={question.id} 
                    href={`/sheet/question/${question.id}/solution`}
                    className="block p-3 rounded-md border bg-muted/30 hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm line-clamp-1">{question.questionId} {question.title}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <DifficultyBadge difficulty={question.difficulty} />
                      <span className="text-muted-foreground truncate">{question.topicId.replace(/-/g, " ")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
      </div>



    </div>
  )
}
