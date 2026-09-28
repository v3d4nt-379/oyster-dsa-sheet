"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchSheetData } from "@/lib/firestore/api"
import { AppTopic, AppQuestion } from "@/types"
import { 
  createTopic, 
  updateTopic, 
  deleteTopic, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from "@/lib/firestore/admin"

type AdminTab = "topics" | "questions"

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = React.useState<AdminTab>("topics")
  const [topics, setTopics] = React.useState<AppTopic[]>([])
  const [isLoadingData, setIsLoadingData] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  // Modals / Forms State
  const [editingTopic, setEditingTopic] = React.useState<AppTopic | null>(null)
  const [isTopicFormOpen, setIsTopicFormOpen] = React.useState(false)
  
  const [editingQuestion, setEditingQuestion] = React.useState<AppQuestion | null>(null)
  const [isQuestionFormOpen, setIsQuestionFormOpen] = React.useState(false)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoadingData(true)
      const data = await fetchSheetData()
      setTopics(data)
    } catch (err) {
      console.error("Failed to load admin data:", err)
      setError("Failed to load data.")
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  React.useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/")
      } else {
        loadData()
      }
    }
  }, [loading, user, isAdmin, router, loadData])

  React.useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  if (loading || isLoadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null // Will redirect
  }

  const handleTopicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const order = parseInt(formData.get("order") as string, 10)
    
    if (!name.trim() || isNaN(order)) {
      setError("Name and Order are required.")
      return
    }

    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, { name, description, order })
        setSuccessMsg("Topic updated.")
      } else {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        if (topics.some(t => t.id === slug)) {
          setError("A topic with this name already exists.")
          return
        }
        await createTopic(slug, name, description, order)
        setSuccessMsg("Topic created.")
      }
      setIsTopicFormOpen(false)
      setEditingTopic(null)
      loadData()
    } catch (err) {
      console.error(err)
      setError("Failed to save topic.")
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId)
    if (topic && topic.questions.length > 0) {
      alert("This topic contains questions. Reassign or remove its questions before deleting the topic.")
      return
    }
    if (confirm("Are you sure you want to delete this topic?")) {
      try {
        await deleteTopic(topicId)
        setSuccessMsg("Topic deleted.")
        loadData()
      } catch (err) {
        console.error(err)
        setError("Failed to delete topic.")
      }
    }
  }

  const handleQuestionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const topicId = formData.get("topicId") as string
    const questionId = formData.get("questionId") as string
    const title = formData.get("title") as string
    const difficulty = formData.get("difficulty") as string
    const order = parseInt(formData.get("order") as string, 10)
    const leetcodeUrl = (formData.get("leetcodeUrl") as string) || null
    const gfgUrl = (formData.get("gfgUrl") as string) || null
    const codechefUrl = (formData.get("codechefUrl") as string) || null
    const explanationMarkdown = (formData.get("explanationMarkdown") as string) || ""
    const timeComplexity = (formData.get("timeComplexity") as string) || ""
    const spaceComplexity = (formData.get("spaceComplexity") as string) || ""
    const cppCode = (formData.get("cppCode") as string) || ""
    const javaCode = (formData.get("javaCode") as string) || ""

    const hasSolution = explanationMarkdown.trim() || timeComplexity.trim() || spaceComplexity.trim() || cppCode.trim() || javaCode.trim()

    const solution = hasSolution ? {
      explanationMarkdown: explanationMarkdown.trim(),
      timeComplexity: timeComplexity.trim(),
      spaceComplexity: spaceComplexity.trim(),
      cppCode: cppCode.trim(),
      javaCode: javaCode.trim()
    } : null

    if (!topicId || !questionId.trim() || !title.trim() || !difficulty || isNaN(order)) {
      setError("Topic, Question ID, Title, Difficulty, and Order are required.")
      return
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          topicId, questionId, title, difficulty, order,
          leetcodeUrl, gfgUrl, codechefUrl, solution
        })
        setSuccessMsg("Question updated.")
      } else {
        const globalId = `${topicId}-${questionId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
        await createQuestion(globalId, {
          topicId, questionId, title, difficulty, order,
          leetcodeUrl, gfgUrl, codechefUrl, solution: solution || undefined
        })
        setSuccessMsg("Question created.")
      }
      setIsQuestionFormOpen(false)
      setEditingQuestion(null)
      loadData()
    } catch (err) {
      console.error(err)
      setError("Failed to save question.")
    }
  }

  const handleDeleteQuestion = async (globalId: string) => {
    if (confirm("Delete this question? User progress/bookmarks associated with this question may become orphaned.")) {
      try {
        await deleteQuestion(globalId)
        setSuccessMsg("Question deleted.")
        loadData()
      } catch (err) {
        console.error(err)
        setError("Failed to delete question.")
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">DSA Sheet Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Logged in as {user.displayName} ({user.email})
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => router.push("/sheet")}>Back to Sheet</Button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-brand/10 text-brand border border-brand/20 p-4 rounded-md flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button 
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'topics' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('topics')}
        >
          Topics
        </button>
        <button 
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'questions' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
      </div>

      {/* Topics View */}
      {activeTab === 'topics' && !isTopicFormOpen && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingTopic(null); setIsTopicFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Topic
            </Button>
          </div>
          <div className="rounded-md border bg-card text-card-foreground">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">ID (Slug)</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.sort((a,b) => a.order - b.order).map(t => (
                  <tr key={t.id} className="border-b">
                    <td className="p-4">{t.order}</td>
                    <td className="p-4 font-mono text-xs">{t.id}</td>
                    <td className="p-4 font-semibold">{t.title}</td>
                    <td className="p-4 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => { setEditingTopic(t); setIsTopicFormOpen(true); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteTopic(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Topic Form */}
      {activeTab === 'topics' && isTopicFormOpen && (
        <div className="rounded-md border bg-card p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">{editingTopic ? "Edit Topic" : "Create Topic"}</h2>
          <form onSubmit={handleTopicSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <input name="name" defaultValue={editingTopic?.title} required className="w-full rounded-md border p-2 bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <input name="description" defaultValue={editingTopic?.description} className="w-full rounded-md border p-2 bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Order</label>
              <input name="order" type="number" defaultValue={editingTopic?.order || topics.length + 1} required className="w-full rounded-md border p-2 bg-background" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit">Save Topic</Button>
              <Button type="button" variant="secondary" onClick={() => setIsTopicFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Questions View */}
      {activeTab === 'questions' && !isQuestionFormOpen && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingQuestion(null); setIsQuestionFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
          </div>
          <div className="rounded-md border bg-card text-card-foreground overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-4 font-medium">Topic</th>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Disp ID</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Solution</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(t => 
                  t.questions.sort((a,b) => a.order - b.order).map(q => (
                    <tr key={q.id} className="border-b">
                      <td className="p-4 text-xs font-mono">{t.title}</td>
                      <td className="p-4">{q.order}</td>
                      <td className="p-4 font-mono text-xs">{q.questionId}</td>
                      <td className="p-4">{q.title}</td>
                      <td className="p-4">
                        {q.solution && (q.solution.explanationMarkdown || q.solution.cppCode || q.solution.javaCode) ? (
                          <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">Available</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Not added</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => { setEditingQuestion(q); setIsQuestionFormOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(q.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Question Form */}
      {activeTab === 'questions' && isQuestionFormOpen && (
        <div className="rounded-md border bg-card p-6 max-w-3xl">
          <h2 className="text-xl font-bold mb-4">{editingQuestion ? "Edit Question" : "Create Question"}</h2>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Topic</label>
                <select name="topicId" defaultValue={editingQuestion?.topicId} required className="w-full rounded-md border p-2 bg-background">
                  {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Question ID (Display)</label>
                <input name="questionId" defaultValue={editingQuestion?.questionId} required className="w-full rounded-md border p-2 bg-background" placeholder="e.g. Q1" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input name="title" defaultValue={editingQuestion?.title} required className="w-full rounded-md border p-2 bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Difficulty</label>
                <select name="difficulty" defaultValue={editingQuestion?.difficulty || "Easy"} required className="w-full rounded-md border p-2 bg-background">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Order</label>
                <input name="order" type="number" defaultValue={editingQuestion?.order || 1} required className="w-full rounded-md border p-2 bg-background" />
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Practice URLs (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">LeetCode</label>
                  <input name="leetcodeUrl" defaultValue={editingQuestion?.links.find(l => l.platform === 'LeetCode')?.url || ""} className="w-full rounded-md border p-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">GeeksforGeeks</label>
                  <input name="gfgUrl" defaultValue={editingQuestion?.links.find(l => l.platform === 'GeeksforGeeks')?.url || ""} className="w-full rounded-md border p-2 bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">CodeChef</label>
                  <input name="codechefUrl" defaultValue={editingQuestion?.links.find(l => l.platform === 'CodeChef')?.url || ""} className="w-full rounded-md border p-2 bg-background text-sm" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h3 className="font-semibold text-sm">Solution</h3>
              
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Explanation / Approach</label>
                <textarea 
                  name="explanationMarkdown" 
                  defaultValue={editingQuestion?.solution?.explanationMarkdown || ""} 
                  rows={4} 
                  className="w-full rounded-md border p-3 bg-background font-mono text-sm"
                  placeholder="Use Markdown for the explanation."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Time Complexity</label>
                  <input 
                    name="timeComplexity" 
                    defaultValue={editingQuestion?.solution?.timeComplexity || ""} 
                    className="w-full rounded-md border p-2 bg-background text-sm" 
                    placeholder="e.g. O(n)"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Space Complexity</label>
                  <input 
                    name="spaceComplexity" 
                    defaultValue={editingQuestion?.solution?.spaceComplexity || ""} 
                    className="w-full rounded-md border p-2 bg-background text-sm" 
                    placeholder="e.g. O(1)"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">C++ Code</label>
                <textarea 
                  name="cppCode" 
                  defaultValue={editingQuestion?.solution?.cppCode || ""} 
                  rows={6} 
                  className="w-full rounded-md border p-3 bg-background font-mono text-sm"
                  placeholder="Paste C++ source code only."
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Java Code</label>
                <textarea 
                  name="javaCode" 
                  defaultValue={editingQuestion?.solution?.javaCode || ""} 
                  rows={6} 
                  className="w-full rounded-md border p-3 bg-background font-mono text-sm"
                  placeholder="Paste Java source code only."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">Save Question</Button>
              <Button type="button" variant="secondary" onClick={() => setIsQuestionFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
