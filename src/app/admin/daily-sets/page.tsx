"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { Loader2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, Search, ArrowUp, ArrowDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeToOkcSheetData } from "@/lib/firestore/api"
import { subscribeToAllDailySets, createDailySet, updateDailySet, deleteDailySet } from "@/lib/firestore/admin"
import { AppTopic, AppQuestion } from "@/types"
import { Timestamp } from "firebase/firestore"

type DailySetFilter = "All" | "Upcoming" | "Active" | "Expired" | "Unpublished"

function getIstDateTimeStrings(date: Date) {
  const dateString = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' 
  }).format(date)
  
  const timeString = new Intl.DateTimeFormat('en-GB', { 
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' 
  }).format(date)

  const displayString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short'
  }).format(date)

  return { dateString, timeString, displayString }
}

export default function DailySetsAdminPage() {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  
  const [dailySets, setDailySets] = React.useState<any[]>([])
  const [topics, setTopics] = React.useState<AppTopic[]>([])
  const [isLoadingSets, setIsLoadingSets] = React.useState(true)
  const [isLoadingTopics, setIsLoadingTopics] = React.useState(true)
  
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [statusFilter, setStatusFilter] = React.useState<DailySetFilter>("All")

  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingSet, setEditingSet] = React.useState<any | null>(null)
  
  const [formName, setFormName] = React.useState("")
  const [formDate, setFormDate] = React.useState("")
  const [formTime, setFormTime] = React.useState("00:00")
  const [formVisible, setFormVisible] = React.useState(false)
  const [selectedQuestionIds, setSelectedQuestionIds] = React.useState<string[]>([])

  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterTopic, setFilterTopic] = React.useState("all")
  const [filterDifficulty, setFilterDifficulty] = React.useState("all")
  const [filterEnabled, setFilterEnabled] = React.useState("all")

  React.useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/")
        return
      }
      
      const unsubSets = subscribeToAllDailySets(
        (data) => {
          setDailySets(data)
          setIsLoadingSets(false)
        },
        (err) => {
          console.error(err)
          setError("Failed to load daily sets.")
          setIsLoadingSets(false)
        }
      )

      const unsubTopics = subscribeToOkcSheetData(
        (data) => {
          setTopics(data)
          setIsLoadingTopics(false)
        },
        (err) => {
          console.error(err)
          setError("Failed to load OKC questions.")
          setIsLoadingTopics(false)
        }
      )

      return () => {
        unsubSets()
        unsubTopics()
      }
    }
  }, [loading, user, isAdmin, router])

  React.useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  if (loading || isLoadingSets || isLoadingTopics) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !isAdmin) return null

  // All questions, both enabled and disabled
  const allQuestions = topics.flatMap(t => 
    t.questions.map(q => ({ ...q, topicTitle: t.title }))
  )

  const availableQuestions = allQuestions.filter(q => {
    if (searchQuery) {
      const qTitle = q.title.toLowerCase()
      const qId = q.questionId.toLowerCase()
      const sq = searchQuery.toLowerCase()
      if (!qTitle.includes(sq) && !qId.includes(sq)) return false
    }
    if (filterTopic !== "all" && q.topicId !== filterTopic) return false
    if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false
    
    if (filterEnabled !== "all") {
      const isEnabled = q.enabled !== false
      if (filterEnabled === "enabled" && !isEnabled) return false
      if (filterEnabled === "disabled" && isEnabled) return false
    }
    
    return true
  }).sort((a, b) => a.order - b.order)

  const selectedQuestionsObjects = selectedQuestionIds.map(id => allQuestions.find(q => q.id === id)).filter(Boolean) as (AppQuestion & { topicTitle: string })[]

  const handleOpenCreateForm = () => {
    setEditingSet(null)
    setFormName("")
    setFormDate("")
    setFormTime("00:00") // Default 12:00 AM IST
    setFormVisible(true)
    setSelectedQuestionIds([])
    setIsFormOpen(true)
  }

  const handleOpenEditForm = (ds: any) => {
    setEditingSet(ds)
    setFormName(ds.name || "")
    
    if (ds.publishAt) {
      const jsDate = ds.publishAt.toDate()
      const { dateString, timeString } = getIstDateTimeStrings(jsDate)
      setFormDate(dateString)
      setFormTime(timeString)
    } else {
      setFormDate("")
      setFormTime("00:00")
    }
    
    setFormVisible(ds.visible ?? false)
    setSelectedQuestionIds(ds.questionIds || [])
    setIsFormOpen(true)
  }

  const checkCollision = (newStart: number, newEnd: number, excludeSetId?: string) => {
    for (const ds of dailySets) {
      if (ds.id === excludeSetId) continue
      if (!ds.publishAt || !ds.expiresAt) continue
      
      const start = ds.publishAt.toMillis()
      const end = ds.expiresAt.toMillis()
      
      // newStart < existingEnd AND newEnd > existingStart
      if (newStart < end && newEnd > start) {
        return ds
      }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formName.trim()) {
      setError("Please provide a name/title.")
      return
    }

    if (!formDate || !formTime) {
      setError("Please select a date and time.")
      return
    }

    if (selectedQuestionIds.length === 0) {
      setError("Please select at least one question.")
      return
    }

    const istDateString = `${formDate}T${formTime}:00+05:30`
    const absoluteDate = new Date(istDateString)
    
    if (isNaN(absoluteDate.getTime())) {
      setError("Invalid date/time combination.")
      return
    }

    const publishAtMs = absoluteDate.getTime()
    const expiresAtMs = publishAtMs + (24 * 60 * 60 * 1000) // +24 hours
    
    // Collision detection
    const collision = checkCollision(publishAtMs, expiresAtMs, editingSet?.id)
    if (collision) {
      const { displayString: startStr } = getIstDateTimeStrings(collision.publishAt.toDate())
      const { displayString: endStr } = getIstDateTimeStrings(collision.expiresAt.toDate())
      setError(`Schedule collision: "${collision.name || collision.id}" is scheduled from ${startStr} IST to ${endStr} IST. The selected time range overlaps with this Daily Set.`)
      return
    }

    const nowMs = Date.now()
    
    // Active edit confirmation
    if (editingSet) {
      const existingStart = editingSet.publishAt?.toMillis() || 0
      const existingEnd = editingSet.expiresAt?.toMillis() || 0
      const wasActive = editingSet.visible && existingStart <= nowMs && nowMs < existingEnd
      
      if (wasActive) {
        if (!confirm("This Daily Set is currently active. Changes will immediately affect students. Continue?")) {
          return
        }
      }
    }

    const publishAt = Timestamp.fromMillis(publishAtMs)
    const expiresAt = Timestamp.fromMillis(expiresAtMs)

    const payload = {
      name: formName.trim(),
      publishAt,
      expiresAt,
      visible: formVisible,
      questionIds: selectedQuestionIds
    }

    try {
      if (editingSet) {
        // If editing an already active/past set that had its expiresAt modified via "Expire Now", 
        // we might not want to blindly override expiresAt back to +24h unless the admin actively changed the start time.
        // But for simplicity of this UI (which doesn't have an explicit expiresAt picker yet), we just default +24h.
        // If it was already manually expired, the prompt implies "recalculate default expiresAt accordingly".
        await updateDailySet(editingSet.id, payload)
        setSuccessMsg("Daily Set updated.")
      } else {
        const newId = `ds-${absoluteDate.getTime()}`
        await createDailySet(newId, payload)
        setSuccessMsg("Daily Set created.")
      }
      setIsFormOpen(false)
    } catch (err) {
      console.error(err)
      setError("Failed to save Daily Set.")
    }
  }

  const handleDelete = async (setId: string) => {
    if (confirm("Delete this Daily Set?\nThis will remove the schedule, but will NOT delete any OKC questions.")) {
      try {
        await deleteDailySet(setId)
        setSuccessMsg("Daily Set deleted.")
      } catch (err) {
        console.error(err)
        setError("Failed to delete Daily Set.")
      }
    }
  }
  
  const handleExpireNow = async (setId: string) => {
    if (confirm("Expire this Daily Set immediately? It will disappear from the student view.")) {
      try {
        await updateDailySet(setId, { expiresAt: Timestamp.now() })
        setSuccessMsg("Daily Set expired.")
      } catch (err) {
        console.error(err)
        setError("Failed to expire Daily Set.")
      }
    }
  }

  const addQuestion = (id: string) => {
    if (!selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds([...selectedQuestionIds, id])
    }
  }

  const removeQuestion = (id: string) => {
    setSelectedQuestionIds(selectedQuestionIds.filter(qId => qId !== id))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newArr = [...selectedQuestionIds]
    const temp = newArr[index]
    newArr[index] = newArr[index - 1]
    newArr[index - 1] = temp
    setSelectedQuestionIds(newArr)
  }

  const moveDown = (index: number) => {
    if (index === selectedQuestionIds.length - 1) return
    const newArr = [...selectedQuestionIds]
    const temp = newArr[index]
    newArr[index] = newArr[index + 1]
    newArr[index + 1] = temp
    setSelectedQuestionIds(newArr)
  }

  const now = Date.now()

  const filteredSets = dailySets.filter(ds => {
    const pub = ds.publishAt?.toMillis() || 0
    const exp = ds.expiresAt?.toMillis() || 0
    
    let status = ""
    if (!ds.visible) status = "Unpublished"
    else if (pub > now) status = "Upcoming"
    else if (pub <= now && now < exp) status = "Active"
    else status = "Expired"

    if (statusFilter === "All") return true
    return statusFilter === status
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Sets Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, schedule, and manage OKC Daily Sets.
          </p>
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

      {!isFormOpen ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(["All", "Upcoming", "Active", "Expired", "Unpublished"] as DailySetFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 text-sm rounded-full ${statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button onClick={handleOpenCreateForm}>
              <Plus className="h-4 w-4 mr-2" /> Create Daily Set
            </Button>
          </div>

          <div className="rounded-md border bg-card text-card-foreground">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Schedule (IST)</th>
                  <th className="p-4 font-medium">Questions</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No Daily Sets found.
                    </td>
                  </tr>
                ) : (
                  filteredSets.map(ds => {
                    const pubDate = ds.publishAt ? ds.publishAt.toDate() : null
                    const expDate = ds.expiresAt ? ds.expiresAt.toDate() : null
                    
                    const pubMs = pubDate?.getTime() || 0
                    const expMs = expDate?.getTime() || 0
                    
                    let statusLabel = ""
                    let statusColor = ""
                    let isActive = false
                    
                    if (!ds.visible) {
                      statusLabel = "Unpublished"
                      statusColor = "text-muted-foreground bg-muted border-muted-foreground/20"
                    } else if (pubMs > now) {
                      statusLabel = "Upcoming"
                      statusColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
                    } else if (pubMs <= now && now < expMs) {
                      statusLabel = "Active"
                      isActive = true
                      statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse"
                    } else {
                      statusLabel = "Expired"
                      statusColor = "text-red-500 bg-red-500/10 border-red-500/20"
                    }

                    return (
                      <tr key={ds.id} className={`border-b last:border-b-0 ${isActive ? 'bg-emerald-500/5' : ''}`}>
                        <td className="p-4 font-medium">{ds.name || ds.id}</td>
                        <td className="p-4 text-xs">
                          {pubDate && expDate ? (
                            <div className="space-y-1">
                              <div><span className="font-semibold">Start:</span> {getIstDateTimeStrings(pubDate).displayString}</div>
                              <div className="text-muted-foreground"><span className="font-semibold text-foreground">End:</span> {getIstDateTimeStrings(expDate).displayString}</div>
                            </div>
                          ) : "Unknown"}
                        </td>
                        <td className="p-4">{ds.questionIds?.length || 0}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {isActive && (
                              <Button variant="secondary" size="sm" onClick={() => handleExpireNow(ds.id)} title="Expire Now">
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => handleOpenEditForm(ds)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(ds.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-md border bg-card p-6">
          <h2 className="text-xl font-bold mb-6">{editingSet ? "Edit Daily Set" : "Create Daily Set"}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 border rounded-md bg-muted/20">
              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-1 block">Name / Title</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                  required 
                  placeholder="e.g. Set A"
                  className="w-full rounded-md border p-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Publish Date (IST)</label>
                <input 
                  type="date" 
                  value={formDate} 
                  onChange={(e) => setFormDate(e.target.value)} 
                  required 
                  className="w-full rounded-md border p-2 bg-background" 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Publish Time (IST)</label>
                <input 
                  type="time" 
                  value={formTime} 
                  onChange={(e) => setFormTime(e.target.value)} 
                  required 
                  className="w-full rounded-md border p-2 bg-background" 
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formVisible} 
                    onChange={(e) => setFormVisible(e.target.checked)} 
                    className="h-4 w-4" 
                  />
                  <span className="text-sm font-medium">Published / Visible</span>
                </label>
              </div>
              <div className="md:col-span-4 text-xs text-muted-foreground border-t pt-2">
                * Note: Expiry is automatically set to 24 hours after Publish Time. Active sets can be manually expired from the dashboard.
                <br />
                {/* TODO: Firebase scheduled backend job should promote questions that were disabled when scheduled once their Daily Set expires. */}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  1. Select Questions
                </h3>
                
                <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-md border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search title or ID..."
                      className="pl-9 pr-4 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterTopic}
                      onChange={(e) => setFilterTopic(e.target.value)}
                      className="py-1.5 px-3 text-xs border rounded-md bg-background flex-1"
                    >
                      <option value="all">All Topics</option>
                      {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="py-1.5 px-3 text-xs border rounded-md bg-background flex-1"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <select
                      value={filterEnabled}
                      onChange={(e) => setFilterEnabled(e.target.value)}
                      className="py-1.5 px-3 text-xs border rounded-md bg-background flex-1"
                    >
                      <option value="all">Any Visibility</option>
                      <option value="enabled">Enabled Only</option>
                      <option value="disabled">Disabled Only</option>
                    </select>
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <tbody>
                      {availableQuestions.length === 0 ? (
                        <tr><td className="p-4 text-center text-muted-foreground">No questions found.</td></tr>
                      ) : (
                        availableQuestions.map(q => {
                          const isSelected = selectedQuestionIds.includes(q.id)
                          const isEnabled = q.enabled !== false
                          
                          return (
                            <tr key={q.id} className={`border-b last:border-b-0 ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                              <td className="p-3">
                                <div className="text-xs text-muted-foreground font-mono">{q.topicTitle} · {q.questionId}</div>
                                <div className="font-medium flex items-center gap-2">
                                  {q.title}
                                  {!isEnabled && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" title="Disabled: Will become visible in Normal Sheet after Daily Set expires">
                                      Disabled
                                    </span>
                                  )}
                                  {isEnabled && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" title="Enabled: Already visible in Normal Sheet">
                                      Enabled
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <Button 
                                  type="button"
                                  variant={isSelected ? "secondary" : "tertiary"} 
                                  size="sm"
                                  onClick={() => isSelected ? removeQuestion(q.id) : addQuestion(q.id)}
                                >
                                  {isSelected ? "Added" : "Add"}
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center justify-between">
                  <span>2. Selected Questions ({selectedQuestionIds.length})</span>
                </h3>
                
                <div className="h-[400px] overflow-y-auto border rounded-md bg-muted/10 p-2 space-y-2">
                  {selectedQuestionsObjects.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      No questions selected.
                    </div>
                  ) : (
                    selectedQuestionsObjects.map((q, index) => {
                      const isEnabled = q.enabled !== false
                      return (
                        <div key={q.id} className="flex items-center justify-between bg-card p-3 rounded-md border shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-muted rounded-full text-xs font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                            <div>
                              <div className="text-xs text-muted-foreground font-mono">{q.topicTitle} · {q.questionId}</div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {q.title}
                                {!isEnabled && <span className="text-[10px] text-red-500 font-semibold">(Disabled)</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button type="button" variant="icon" className="h-8 w-8" onClick={() => moveUp(index)} disabled={index === 0}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="icon" className="h-8 w-8" onClick={() => moveDown(index)} disabled={index === selectedQuestionsObjects.length - 1}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button type="button" variant="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeQuestion(q.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-6 border-t">
              <Button type="submit">Save Daily Set</Button>
              <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
