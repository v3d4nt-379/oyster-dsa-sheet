"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { ArrowLeft, Check, Copy, Loader2, AlertCircle } from "lucide-react"

import { useAuth } from "@/lib/firebase/auth-context"
import { subscribeToOkcQuestion } from "@/lib/firestore/api"
import { AppQuestion } from "@/types"
import { DifficultyBadge } from "@/components/dsa/difficulty-badge"
import { Button } from "@/components/ui/button"

export default function OkcSolutionPage() {
  const { user, loading, isAdmin, isClubMember } = useAuth()
  const router = useRouter()
  const params = useParams()
  
  const questionId = params.questionId as string
  
  const [question, setQuestion] = React.useState<AppQuestion | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const [activeTab, setActiveTab] = React.useState<"cpp" | "java">("cpp")
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    } else if (user && !isAdmin && !isClubMember) {
      router.push("/")
    }
  }, [loading, user, router, isAdmin, isClubMember])

  React.useEffect(() => {
    if (!questionId || !user || (!isAdmin && !isClubMember)) return
    
    setIsLoading(true)
    const unsubscribe = subscribeToOkcQuestion(
      questionId,
      (data) => {
        if (data) {
          setQuestion(data)
          if (data.solution) {
            if (data.solution.cppCode && !data.solution.javaCode) {
              setActiveTab("cpp")
            } else if (!data.solution.cppCode && data.solution.javaCode) {
              setActiveTab("java")
            }
          }
        } else {
          setError("Question not found")
        }
        setIsLoading(false)
      },
      (err) => {
        console.error(err)
        setError("Unable to load this solution. Please try again.")
        setIsLoading(false)
      }
    )
    
    return () => unsubscribe()
  }, [questionId, user, isAdmin, isClubMember])

  const handleCopy = async () => {
    if (!question?.solution) return
    const textToCopy = activeTab === "cpp" ? question.solution.cppCode : question.solution.javaCode
    if (!textToCopy) return
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code", err)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || (!isAdmin && !isClubMember)) return null

  if (error) {
    return (
      <div className="mx-auto max-w-4xl pt-8 space-y-6">
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <Link href="/sheet/okc" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to OKC Sheet
        </Link>
      </div>
    )
  }

  if (!question) return null

  // Visibility Guard
  if (!isAdmin && question.enabled === false) {
    return (
      <div className="mx-auto max-w-4xl pt-8 space-y-6">
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p>This question is currently unavailable.</p>
        </div>
        <Link href="/sheet/okc" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to OKC Sheet
        </Link>
      </div>
    )
  }

  const isSolutionAvailable = isAdmin || question.solutionEnabled !== false
  const sol = question.solution
  const hasSolutionContent = sol && (sol.explanationMarkdown || sol.timeComplexity || sol.spaceComplexity || sol.cppCode || sol.javaCode)
  
  const hasSolution = isSolutionAvailable && hasSolutionContent
  const hasComplexity = isSolutionAvailable && sol && (sol.timeComplexity || sol.spaceComplexity)
  const hasCode = isSolutionAvailable && sol && (sol.cppCode || sol.javaCode)

  return (
    <div className="mx-auto max-w-4xl pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <Link href="/sheet/okc" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to OKC Sheet
        </Link>
        <div className="border-b pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-muted-foreground">{question.questionId}</span>
            <h1 className="text-2xl font-bold tracking-tight">{question.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <DifficultyBadge difficulty={question.difficulty} />
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand/50"></span>
              Topic: {question.topicId.replace(/-/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Empty / Unavailable State */}
      {!hasSolution && (
        <div className="py-12 text-center space-y-4 border rounded-lg bg-card/50">
          <h2 className="text-xl font-semibold">
            {!isSolutionAvailable ? "Solution unavailable." : "Solution not available yet."}
          </h2>
          <p className="text-muted-foreground">
            {!isSolutionAvailable 
              ? "The solution for this question is currently hidden."
              : "This question does not have a published solution."}
          </p>
        </div>
      )}

      {hasSolution && (
        <div className="space-y-12">
          
          {/* Explanation */}
          {sol.explanationMarkdown && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-brand">#</span> Approach
              </h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sol.explanationMarkdown}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* Complexity */}
          {hasComplexity && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-brand">#</span> Complexity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sol.timeComplexity && (
                  <div className="border rounded-md p-4 bg-card shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Time Complexity</p>
                    <p className="font-mono text-lg font-medium">{sol.timeComplexity}</p>
                  </div>
                )}
                {sol.spaceComplexity && (
                  <div className="border rounded-md p-4 bg-card shadow-sm">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Space Complexity</p>
                    <p className="font-mono text-lg font-medium">{sol.spaceComplexity}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Code */}
          {hasCode && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-brand">#</span> Code
              </h2>
              <div className="rounded-md border bg-zinc-950 overflow-hidden shadow-sm">
                
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4">
                  <div className="flex">
                    {sol.cppCode && (
                      <button
                        onClick={() => setActiveTab("cpp")}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                          activeTab === "cpp" 
                            ? "border-brand text-zinc-100" 
                            : "border-transparent text-zinc-400 hover:text-zinc-300"
                        }`}
                      >
                        C++
                      </button>
                    )}
                    {sol.javaCode && (
                      <button
                        onClick={() => setActiveTab("java")}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                          activeTab === "java" 
                            ? "border-brand text-zinc-100" 
                            : "border-transparent text-zinc-400 hover:text-zinc-300"
                        }`}
                      >
                        Java
                      </button>
                    )}
                  </div>
                  
                  <Button 
                    variant="tertiary" 
                    size="sm" 
                    className="h-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                {/* Code Viewer */}
                <div className="p-4 overflow-x-auto text-sm">
                  <SyntaxHighlighter
                    language={activeTab === "cpp" ? "cpp" : "java"}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: "transparent",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {activeTab === "cpp" ? sol.cppCode || "" : sol.javaCode || ""}
                  </SyntaxHighlighter>
                </div>
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
